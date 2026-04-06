import { useMemo, useState } from "react";
import { ArrowLeft, Star, Zap, Shield, Calendar, Users, Upload } from "lucide-react";
import type { RoomImage, Trophy, UserProfile, UserStats } from "../types/userData";

const FRIENDS = [
  { name: "Arjun", initial: "A" },
  { name: "Priya", initial: "P" },
  { name: "Karthik", initial: "K" },
];

export default function ProfileScreen({
  onBack,
  profile,
  stats,
  trophies,
  roomImages,
  onProfileChange,
  onUploadRoomImage,
  onCreateTrophy,
}: {
  onBack: () => void;
  profile: UserProfile;
  stats: UserStats;
  trophies: Trophy[];
  roomImages: RoomImage[];
  onProfileChange: (profile: UserProfile) => void;
  onUploadRoomImage: (file: File) => Promise<void>;
  onCreateTrophy: (name: string, file: File) => Promise<void>;
}) {
  const [uploadingRoomImage, setUploadingRoomImage] = useState(false);
  const [uploadingTrophy, setUploadingTrophy] = useState(false);
  const [newTrophyName, setNewTrophyName] = useState("");
  const [trophyFile, setTrophyFile] = useState<File | null>(null);

  const statsRows = useMemo(
    () => [
      { icon: <Star size={14} color="#f5c842" />, label: "Reputation Points", value: `${stats.reputationPoints} XP` },
      { icon: <Zap size={14} color="#c4855a" />, label: "Brownie Points", value: `${stats.browniePoints} pts` },
      { icon: <Shield size={14} color="#7c9a7e" />, label: "Bets Won", value: `${stats.wins}` },
      { icon: <Calendar size={14} color="#a8a6a2" />, label: "Member Since", value: profile.memberSince },
    ],
    [profile.memberSince, stats]
  );

  const handleFirstRoomUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingRoomImage(true);
    try {
      await onUploadRoomImage(file);
    } finally {
      setUploadingRoomImage(false);
      event.target.value = "";
    }
  };

  const handleCreateTrophy = async () => {
    if (!newTrophyName.trim() || !trophyFile) return;

    setUploadingTrophy(true);
    try {
      await onCreateTrophy(newTrophyName.trim(), trophyFile);
      setNewTrophyName("");
      setTrophyFile(null);
    } finally {
      setUploadingTrophy(false);
    }
  };

  return (
    <div style={page}>
      <div style={inner}>

        {/* Top bar */}
        <div style={topBar}>
          <button onClick={onBack} style={iconBtn}><ArrowLeft size={16} /></button>
          <h1 style={heading}>Profile</h1>
          <div style={{ width: 36 }} />
        </div>

        {/* Two-column layout */}
        <div style={layout}>

          {/* Left: avatar + friends */}
          <div>
            <div style={avatar}>A</div>
            <input
              value={profile.displayName}
              onChange={(event) =>
                onProfileChange({
                  ...profile,
                  displayName: event.target.value,
                })
              }
              style={{ ...usernameInput, ...username }}
            />
            <p style={tagline}>showing up, one habit at a time</p>

            <div style={card}>
              <div style={sectionLabel}><Users size={11} /> Friends ({FRIENDS.length})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {FRIENDS.map((f, i) => (
                  <div key={i} style={friendRow}>
                    <div style={friendAvatar}>{f.initial}</div>
                    <span style={{ fontSize: 14, color: "#f1efe9" }}>{f.name}</span>
                  </div>
                ))}
                <div style={{ ...friendRow, color: "#a8a6a2", cursor: "pointer", background: "transparent", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px" }}>
                  + Add Friend
                </div>
              </div>
            </div>
          </div>

          {/* Right: stats */}
          <div style={card}>
            <div style={sectionLabel}>Stats</div>
            {statsRows.map((s, i) => (
              <div key={i} style={{ ...statRow, borderBottom: i === statsRows.length - 1 ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#a8a6a2", fontSize: 14 }}>
                  {s.icon} {s.label}
                </div>
                <span style={{ color: "#f1efe9", fontWeight: 600, fontSize: 14 }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div style={card}>
            <div style={sectionLabel}><Upload size={11} /> First Room Images ({roomImages.length})</div>
            <label style={uploadBtn}>
              {uploadingRoomImage ? "Uploading..." : "Upload jpg  Image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFirstRoomUpload}
                style={{ display: "none" }}
                disabled={uploadingRoomImage}
              />
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {roomImages.slice(0, 4).map((image) => (
                <div key={image.id} style={assetRow}>{image.name}</div>
              ))}
              {roomImages.length === 0 && <div style={assetHint}>No room images yet.</div>}
            </div>
          </div>

          <div style={card}>
            <div style={sectionLabel}>Trophy Room ({trophies.length})</div>
            <input
              value={newTrophyName}
              onChange={(event) => setNewTrophyName(event.target.value)}
              placeholder="Trophy title"
              style={textInput}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setTrophyFile(event.target.files?.[0] || null)}
              style={{ ...textInput, padding: "8px 10px" }}
            />
            <button onClick={() => void handleCreateTrophy()} style={uploadBtn} disabled={uploadingTrophy}>
              {uploadingTrophy ? "Saving Trophy..." : "Add Trophy"}
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {trophies.slice(0, 4).map((trophy) => (
                <div key={trophy.id} style={assetRow}>{trophy.name}</div>
              ))}
              {trophies.length === 0 && <div style={assetHint}>No trophies yet.</div>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const page: React.CSSProperties      = { minHeight: "100vh", background: "#1f2321", display: "flex", justifyContent: "center", padding: "0 24px 120px" };
const inner: React.CSSProperties     = { width: "100%", maxWidth: 820, paddingTop: 40 };
const topBar: React.CSSProperties    = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 };
const iconBtn: React.CSSProperties   = { width: 36, height: 36, borderRadius: "50%", border: "none", background: "#2a2f2c", color: "#a8a6a2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" };
const heading: React.CSSProperties   = { fontFamily: "Georgia, serif", fontSize: 22, color: "#f1efe9", margin: 0, fontWeight: 400 };
const layout: React.CSSProperties    = { display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" };
const avatar: React.CSSProperties    = { width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#7c9a7e,#4a6b4c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#1f2321", marginBottom: 14, boxShadow: "0 0 0 4px rgba(124,154,126,0.2)" };
const username: React.CSSProperties  = { fontFamily: "Georgia, serif", fontSize: 20, color: "#f1efe9", margin: "0 0 4px", fontWeight: 400 };
const tagline: React.CSSProperties   = { color: "#a8a6a2", fontSize: 13, margin: "0 0 20px" };
const card: React.CSSProperties      = { background: "#2a2f2c", borderRadius: 16, padding: "18px 20px" };
const sectionLabel: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b6967", marginBottom: 14 };
const statRow: React.CSSProperties   = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0" };
const friendRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, padding: "8px 0" };
const friendAvatar: React.CSSProperties = { width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#7c9a7e,#4a6b4c)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#1f2321" };
const usernameInput: React.CSSProperties = { background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "6px 10px", width: "100%", color: "#f1efe9", fontFamily: "Georgia, serif" };
const uploadBtn: React.CSSProperties = { marginTop: 8, border: "none", borderRadius: 10, background: "#7c9a7e", color: "#1f2321", padding: "10px 14px", cursor: "pointer", fontWeight: 600, width: "fit-content" };
const assetRow: React.CSSProperties = { padding: "8px 10px", borderRadius: 10, background: "rgba(255,255,255,0.04)", color: "#f1efe9", fontSize: 13 };
const assetHint: React.CSSProperties = { color: "#a8a6a2", fontSize: 12 };
const textInput: React.CSSProperties = { width: "100%", background: "#1f2321", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#f1efe9", padding: "10px 12px", marginTop: 8 };