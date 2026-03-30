import { useEffect, useMemo, useRef, useState } from "react";

import LoginScreen from "./screens/LoginScreen";
import ChooseScreen from "./screens/Choose";
import MinimalHome from "./screens/Minimalhome";
import GamifiedHome from "./screens/GamifiedHome";
import AddHabitScreen from "./screens/AddHabit";
import SidequestsScreen from "./screens/SideQuests";
import BetsScreen from "./screens/Bets";
import ProfileScreen from "./screens/Profiles";

import MinimalNav from "./screens/MinimalNav";
import GamifiedNav from "./screens/GamifiedNav";
import { useNotifications } from "./hooks/useNotifications";
import { fetchUserData, saveUserData, uploadUserImage } from "./lib/userDataStore";
import seedSidequests from "./data/sidequests.json";
import seedBets from "./data/bets.json";
import type {
  Bet,
  HabitItem,
  RoomImage,
  SessionUser,
  Sidequest,
  Trophy,
  UserDataDocument,
  UserProfile,
  UserStats,
} from "./types/userData";

export type Habit = HabitItem;

export type Screen =
  | "login"
  | "choose"
  | "minimal-home"
  | "minimal-quests"
  | "minimal-bets"
  | "minimal-profile"
  | "minimal-addHabit"
  | "gamified-home"
  | "gamified-addHabit"
  | "gamified-quests"
  | "gamified-bets"
  | "gamified-profile";

const SESSION_KEY = "habo_session_v1";
const GUEST_DATA_KEY = "habo_guest_data_v1";
const USER_DATA_PREFIX = "habo_user_data_v1_";
const USER_DATA_EMAIL_PREFIX = "habo_user_data_email_v1_";
const THREE_ROOM_IMAGES_KEY = "habo_3d_room_images";
const THREE_TROPHY_IMAGES_KEY = "habo_3d_trophy_images";

const DEFAULT_HABITS: HabitItem[] = [
  { id: 1, name: "Drink water", done: false },
  { id: 2, name: "Move your body", done: false },
  { id: 3, name: "Read", done: false },
];

const DEFAULT_SIDEQUESTS: Sidequest[] = seedSidequests as Sidequest[];
const DEFAULT_BETS: Bet[] = (seedBets as Bet[]).map((bet) => ({
  ...bet,
  title: bet.title || `${bet.opponent} bets you won't ${bet.activity}`,
}));

const DEFAULT_STATS: UserStats = {
  reputationPoints: 340,
  browniePoints: 1200,
  wins: 8,
};

const DEFAULT_PROFILE: UserProfile = {
  displayName: "Aditya",
  memberSince: "Jan 2025",
};

function readInitialSession(): { screen: Screen; user: SessionUser | null } {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { screen: "login", user: null };
    const parsed = JSON.parse(raw) as { screen?: Screen; user?: SessionUser | null };
    return {
      screen: parsed.user ? parsed.screen || "choose" : "login",
      user: parsed.user || null,
    };
  } catch {
    return { screen: "login", user: null };
  }
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const timeoutId = window.setTimeout(() => {
      reader.abort();
      reject(new Error("Image read timed out."));
    }, 20000);

    reader.onloadend = () => {
      window.clearTimeout(timeoutId);
      resolve(String(reader.result || ""));
    };
    reader.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error("Failed to read file."));
    };
    reader.onabort = () => {
      window.clearTimeout(timeoutId);
      reject(new Error("Image read aborted."));
    };
    reader.readAsDataURL(file);
  });
}

async function optimizeImageForLocal(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    return fileToDataUrl(file);
  }

  const original = await fileToDataUrl(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Failed to decode image."));
    element.src = original;
  });

  const maxSide = 1280;
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return original;

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.78);
}

function withoutLargeDataUrls(payload: UserDataDocument): UserDataDocument {
  return {
    ...payload,
    roomImages: payload.roomImages.map((image) => ({
      ...image,
      url: image.url.startsWith("data:") ? "" : image.url,
    })),
    trophies: payload.trophies.map((trophy) => ({
      ...trophy,
      imageUrl: trophy.imageUrl.startsWith("data:") ? "" : trophy.imageUrl,
    })),
  };
}

function saveLocalUserDataSafe(key: string, payload: UserDataDocument): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error("Local save failed, trying slim payload", error);
    try {
      localStorage.setItem(key, JSON.stringify(withoutLargeDataUrls(payload)));
      return true;
    } catch (fallbackError) {
      console.error("Local fallback save failed", fallbackError);
      return false;
    }
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer = 0;
  const timeout = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    window.clearTimeout(timer);
  }
}

function isPermissionError(error: unknown): boolean {
  const code = (error as { code?: string })?.code || "";
  const message = (error as { message?: string })?.message || "";
  return code.includes("permission-denied") || message.toLowerCase().includes("insufficient permissions");
}

function getUserDataKeys(user: SessionUser): string[] {
  if (user.isGuest) return [GUEST_DATA_KEY];
  const keys = [`${USER_DATA_PREFIX}${user.id}`];
  const normalizedEmail = (user.email || "").toLowerCase().trim();
  if (normalizedEmail) {
    keys.push(`${USER_DATA_EMAIL_PREFIX}${normalizedEmail}`);
  }
  return keys;
}

function pickNewestData(candidates: Array<UserDataDocument | null>): UserDataDocument | null {
  const valid = candidates.filter((item): item is UserDataDocument => !!item);
  if (valid.length === 0) return null;
  return valid.sort((a, b) => {
    const aTime = Date.parse(a.updatedAt || "") || 0;
    const bTime = Date.parse(b.updatedAt || "") || 0;
    return bTime - aTime;
  })[0];
}

function saveLocalAcrossKeys(user: SessionUser, payload: UserDataDocument): boolean {
  const keys = getUserDataKeys(user);
  let savedAny = false;
  for (const key of keys) {
    const ok = saveLocalUserDataSafe(key, payload);
    savedAny = savedAny || ok;
  }
  return savedAny;
}

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: blob.type || "application/octet-stream" });
}

export default function App() {
  const initialSession = useMemo(readInitialSession, []);
  const [screen, setScreen] = useState<Screen>(initialSession.screen);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(initialSession.user);
  const [isHydratingData, setIsHydratingData] = useState(false);
  const hasLoadedUserData = useRef(false);

  const [nextId, setNextId] = useState(4);

  const [habits, setHabits] = useState<HabitItem[]>(DEFAULT_HABITS);
  const [sidequests, setSidequests] = useState<Sidequest[]>(DEFAULT_SIDEQUESTS);
  const [bets, setBets] = useState<Bet[]>(DEFAULT_BETS);
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [roomImages, setRoomImages] = useState<RoomImage[]>([]);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState("");

  const notifications = useNotifications();

  useEffect(() => {
    const inferredNextId = Math.max(0, ...habits.map((habit) => habit.id)) + 1;
    setNextId(inferredNextId);
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        screen: currentUser ? screen : "login",
        user: currentUser,
      })
    );
  }, [screen, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      hasLoadedUserData.current = false;
      return;
    }

    const returnTarget = sessionStorage.getItem("habo_3d_return");
    if (returnTarget === "gamified-home") {
      sessionStorage.removeItem("habo_3d_return");
      setScreen("gamified-home");
    }
  }, [currentUser]);

  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;

      setIsHydratingData(true);
      try {
        const localCandidates: Array<UserDataDocument | null> = [];
        for (const key of getUserDataKeys(currentUser)) {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          try {
            localCandidates.push(JSON.parse(raw) as UserDataDocument);
          } catch {
            localCandidates.push(null);
          }
        }

        const cloudCandidate = currentUser.isGuest
          ? null
          : await fetchUserData(currentUser.id);

        const loaded = pickNewestData([...localCandidates, cloudCandidate]);

        if (loaded) {
          setHabits(loaded.habits || DEFAULT_HABITS);
          setSidequests(loaded.sidequests || DEFAULT_SIDEQUESTS);
          setBets(loaded.bets || DEFAULT_BETS);
          setTrophies(loaded.trophies || []);
          setRoomImages(loaded.roomImages || []);
          setStats(loaded.stats || DEFAULT_STATS);
          setProfile(loaded.profile || DEFAULT_PROFILE);
        } else {
          setHabits(DEFAULT_HABITS);
          setSidequests(DEFAULT_SIDEQUESTS);
          setBets(DEFAULT_BETS);
          setTrophies([]);
          setRoomImages([]);
          setStats(DEFAULT_STATS);
          setProfile({
            ...DEFAULT_PROFILE,
            displayName: currentUser.isGuest
              ? "Guest"
              : currentUser.email.split("@")[0] || DEFAULT_PROFILE.displayName,
          });
        }
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error("Failed loading user data", error);
      } finally {
        hasLoadedUserData.current = true;
        setIsHydratingData(false);
      }
    };

    void loadUserData();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !hasLoadedUserData.current) return;

    const payload: UserDataDocument = {
      habits,
      sidequests,
      bets,
      trophies,
      roomImages,
      stats,
      profile,
      updatedAt: new Date().toISOString(),
    };

    saveLocalAcrossKeys(currentUser, payload);

    localStorage.setItem(
      THREE_ROOM_IMAGES_KEY,
      JSON.stringify(roomImages.map((image) => image.url))
    );
    localStorage.setItem(
      THREE_TROPHY_IMAGES_KEY,
      JSON.stringify(trophies.map((trophy) => trophy.imageUrl).filter(Boolean))
    );

    if (!isHydratingData) {
      setHasUnsavedChanges(true);
    }
  }, [
    currentUser,
    habits,
    sidequests,
    bets,
    trophies,
    roomImages,
    stats,
    profile,
    isHydratingData,
  ]);

  // ─────────────────────────────────────────────
  // Habit Logic
  // ─────────────────────────────────────────────

  const toggleHabit = (id: number) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, done: !h.done } : h
      )
    );
  };

  const deleteHabit = (id: number) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const addHabit = (name: string) => {
    setHabits((prev) => [
      ...prev,
      { id: nextId, name, done: false },
    ]);
    setNextId((n) => n + 1);
  };

  // ─────────────────────────────────────────────
  // Mode detection
  // ─────────────────────────────────────────────

  const isMinimal = screen.startsWith("minimal-");
  const isGamified = screen.startsWith("gamified-");

  const handleRoomImageUpload = async (file: File) => {
    if (!currentUser) return;

    try {
      const url = await optimizeImageForLocal(file);

      setRoomImages((prev) => [
        {
          id: `room-${Date.now()}`,
          name: file.name,
          url,
          uploadedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch (error) {
      console.error("Room image upload failed:", error);
    }
  };

  const handleTrophyCreate = async (name: string, file: File) => {
    if (!currentUser) return;

    try {
      const imageUrl = await optimizeImageForLocal(file);

      setTrophies((prev) => [
        {
          id: `trophy-${Date.now()}`,
          name,
          imageUrl,
          earnedAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setStats((prev) => ({
        ...prev,
        wins: prev.wins + 1,
        reputationPoints: prev.reputationPoints + 10,
      }));
    } catch (error) {
      console.error("Trophy creation failed:", error);
    }
  };

  const handleSaveAllChanges = async () => {
    if (!currentUser || isSaving) return;

    setIsSaving(true);
    try {
      const basePayload: UserDataDocument = {
        habits,
        sidequests,
        bets,
        trophies,
        roomImages,
        stats,
        profile,
        updatedAt: new Date().toISOString(),
      };

      const localSaved = saveLocalAcrossKeys(currentUser, basePayload);
      if (!localSaved) {
        throw new Error("Unable to save locally. Try smaller image files.");
      }
      setSaveStatusMessage("Local saved");
      setHasUnsavedChanges(false);

      if (!currentUser.isGuest) {
        try {
          let cloudUploadFailed = false;
          let storagePlanBlocked = false;

          const syncedRoomImages: RoomImage[] = await Promise.all(
            roomImages.map(async (image) => {
              if (!image.url.startsWith("data:")) return image;
              try {
                const uploadFile = await dataUrlToFile(image.url, image.name || `room-${image.id}.jpg`);
                const uploadedUrl = await withTimeout(
                  uploadUserImage(currentUser.id, uploadFile, "first-room"),
                  30000,
                  "Room image upload"
                );
                return { ...image, url: uploadedUrl };
              } catch (error) {
                cloudUploadFailed = true;
                const message = ((error as { message?: string })?.message || "").toLowerCase();
                if (message.includes("pricing plan") || message.includes("default bucket") || message.includes("storage_upload_failed")) {
                  storagePlanBlocked = true;
                }
                console.error("Room image cloud upload failed", error);
                return image;
              }
            })
          );

          const syncedTrophies: Trophy[] = await Promise.all(
            trophies.map(async (trophy) => {
              if (!trophy.imageUrl.startsWith("data:")) return trophy;
              try {
                const uploadFile = await dataUrlToFile(trophy.imageUrl, `${trophy.name || trophy.id}.jpg`);
                const uploadedUrl = await withTimeout(
                  uploadUserImage(currentUser.id, uploadFile, "trophy-room"),
                  30000,
                  "Trophy upload"
                );
                return { ...trophy, imageUrl: uploadedUrl };
              } catch (error) {
                cloudUploadFailed = true;
                const message = ((error as { message?: string })?.message || "").toLowerCase();
                if (message.includes("pricing plan") || message.includes("default bucket") || message.includes("storage_upload_failed")) {
                  storagePlanBlocked = true;
                }
                console.error("Trophy cloud upload failed", error);
                return trophy;
              }
            })
          );

          const cloudPayloadBase: UserDataDocument = {
            ...basePayload,
            roomImages: syncedRoomImages,
            trophies: syncedTrophies,
            updatedAt: new Date().toISOString(),
          };

          // If Storage upload is blocked/unavailable, still save non-image data to Firestore.
          const cloudPayload = cloudUploadFailed
            ? withoutLargeDataUrls(cloudPayloadBase)
            : cloudPayloadBase;

          await saveUserData(currentUser.id, cloudPayload);
          setRoomImages(syncedRoomImages);
          setTrophies(syncedTrophies);
          saveLocalAcrossKeys(currentUser, cloudPayload);

          if (cloudUploadFailed) {
            setSaveStatusMessage(
              storagePlanBlocked
                ? "Cloud saved (habits/profile). Images local only until Storage plan upgrade."
                : "Cloud saved (without new images). Images remain local."
            );
          } else {
            setSaveStatusMessage("Local + cloud saved");
          }
        } catch (cloudError) {
          console.error("Cloud sync failed", cloudError);
          const detail = (cloudError as { message?: string })?.message || "Unknown cloud error";
          if (isPermissionError(cloudError)) {
            setSaveStatusMessage(`Local saved. Cloud blocked: ${detail}`);
          } else {
            setSaveStatusMessage(`Local saved. Cloud sync failed: ${detail}`);
          }
        }
      }
    } catch (error) {
      console.error("Manual save failed", error);
      setSaveStatusMessage(
        (error as { message?: string })?.message || "Save failed"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1f2321",
        fontFamily: "'Inter', sans-serif",
        color: "#f1efe9",
      }}
    >
      {/* ───────── LOGIN ───────── */}
      {screen === "login" && (
        <LoginScreen onLogin={(user) => {
          setCurrentUser(user);
          setScreen("choose");
        }} />
      )}

      {/* ───────── CHOOSE ───────── */}
      {screen === "choose" && (
        <ChooseScreen
          onBack={() => {
            setCurrentUser(null);
            setScreen("login");
          }}
          onChoose={(mode) =>
            setScreen(
              mode === "minimal"
                ? "minimal-home"
                : "gamified-home"
            )
          }
        />
      )}

      {/* ───────── MINIMAL ───────── */}
      {screen === "minimal-home" && (
        <MinimalHome
          habits={habits}
          onToggle={toggleHabit}
          onDelete={deleteHabit}
          onAdd={() => setScreen("minimal-addHabit")}
          onBack={() => setScreen("choose")}
        />
      )}

      {screen === "minimal-addHabit" && (
        <AddHabitScreen
          onAdd={(name) => {
            addHabit(name);
            setScreen("minimal-home");
          }}
          onBack={() => setScreen("minimal-home")}
        />
      )}

      {screen === "minimal-quests" && (
        <SidequestsScreen
          quests={sidequests}
          onChange={setSidequests}
          onBack={() => setScreen("minimal-home")}
        />
      )}

      {screen === "minimal-bets" && (
        <BetsScreen
          bets={bets}
          onChange={setBets}
          onBack={() => setScreen("minimal-home")}
          onAddNotification={notifications.addNotification}
        />
      )}

      {screen === "minimal-profile" && (
        <ProfileScreen
          profile={profile}
          stats={stats}
          trophies={trophies}
          roomImages={roomImages}
          onProfileChange={setProfile}
          onUploadRoomImage={handleRoomImageUpload}
          onCreateTrophy={handleTrophyCreate}
          onBack={() => setScreen("minimal-home")}
        />
      )}

      {/* ───────── GAMIFIED ───────── */}
      {screen === "gamified-home" && (
        <GamifiedHome
          sidequests={sidequests}
          bets={bets}
          stats={stats}
          onSidequestsChange={setSidequests}
          onBetsChange={setBets}
          onExit={() => setScreen("choose")}
        />
      )}

      {screen === "gamified-addHabit" && (
        <AddHabitScreen
          onAdd={(name) => {
            addHabit(name);
            setScreen("gamified-home");
          }}
          onBack={() => setScreen("gamified-home")}
        />
      )}

      {screen === "gamified-quests" && (
        <SidequestsScreen
          quests={sidequests}
          onChange={setSidequests}
          onBack={() => setScreen("gamified-home")}
        />
      )}

      {screen === "gamified-bets" && (
        <BetsScreen
          bets={bets}
          onChange={setBets}
          onBack={() => setScreen("gamified-home")}
          onAddNotification={notifications.addNotification}
        />
      )}

      {screen === "gamified-profile" && (
        <ProfileScreen
          profile={profile}
          stats={stats}
          trophies={trophies}
          roomImages={roomImages}
          onProfileChange={setProfile}
          onUploadRoomImage={handleRoomImageUpload}
          onCreateTrophy={handleTrophyCreate}
          onBack={() => setScreen("gamified-home")}
        />
      )}

      {isHydratingData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(31,35,33,0.7)",
            zIndex: 4000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#f1efe9",
            fontSize: "14px",
            letterSpacing: "0.04em",
          }}
        >
          Syncing your data...
        </div>
      )}

      {currentUser && screen !== "login" && (
        <div
          style={{
            position: "fixed",
            right: 22,
            bottom: 96,
            zIndex: 3500,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "flex-end",
          }}
        >
          <button
            onClick={() => void handleSaveAllChanges()}
            disabled={isSaving || isHydratingData || !hasUnsavedChanges}
            style={{
              border: "none",
              borderRadius: 12,
              background: isSaving ? "#5f7b60" : hasUnsavedChanges ? "#7c9a7e" : "#4f5452",
              color: "#1f2321",
              padding: "11px 16px",
              fontWeight: 700,
              cursor: isSaving || !hasUnsavedChanges ? "not-allowed" : "pointer",
              opacity: isSaving || !hasUnsavedChanges ? 0.7 : 1,
            }}
          >
            {isSaving ? "Saving..." : hasUnsavedChanges ? "Save" : "Saved"}
          </button>
          {!!saveStatusMessage && (
            <div style={{ color: "#a8a6a2", fontSize: 12, maxWidth: 260, textAlign: "right" }}>
              {saveStatusMessage}
            </div>
          )}
        </div>
      )}

      {/* ───────── NAVIGATION ───────── */}

      {isMinimal && (
        <MinimalNav screen={screen} setScreen={setScreen} />
      )}

      {isGamified && (
        <GamifiedNav
          screen={screen}
          setScreen={setScreen}
        />
      )}
    </div>
  );
}