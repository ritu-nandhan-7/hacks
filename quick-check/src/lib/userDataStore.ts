import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { auth, db, isFirebaseConfigured, storage } from "./firebase";
import type { UserDataDocument } from "../types/userData";

const COLLECTION = "users";

export function canUseCloudStore() {
  return isFirebaseConfigured && !!db && !!storage;
}

export async function fetchUserData(userId: string): Promise<UserDataDocument | null> {
  if (!db || !canUseCloudStore()) return null;

  const snapshot = await getDoc(doc(db, COLLECTION, userId));
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserDataDocument;
}

export async function saveUserData(userId: string, data: UserDataDocument) {
  if (!db || !canUseCloudStore()) {
    throw new Error("FIRESTORE_SAVE_FAILED (not-configured): Firebase Firestore is not configured.");
  }

  const uid = auth?.currentUser?.uid;
  if (!uid) {
    throw new Error("FIRESTORE_SAVE_FAILED (auth-missing): No authenticated Firebase user.");
  }
  if (uid !== userId) {
    throw new Error(`FIRESTORE_SAVE_FAILED (auth-mismatch): auth uid ${uid} != payload uid ${userId}`);
  }

  try {
    await setDoc(doc(db, COLLECTION, userId), data, { merge: true });
  } catch (error) {
    const code = (error as { code?: string })?.code || "unknown";
    const message = (error as { message?: string })?.message || "Unknown Firestore error";
    throw new Error(`FIRESTORE_SAVE_FAILED (${code}): ${message}`);
  }
}

export async function uploadUserImage(
  userId: string,
  file: File,
  folder: "first-room" | "trophy-room"
) {
  if (!storage || !canUseCloudStore()) {
    throw new Error("STORAGE_UPLOAD_FAILED (not-configured): Firebase Storage is not configured.");
  }

  const uid = auth?.currentUser?.uid;
  if (!uid) {
    throw new Error("STORAGE_UPLOAD_FAILED (auth-missing): No authenticated Firebase user.");
  }
  if (uid !== userId) {
    throw new Error(`STORAGE_UPLOAD_FAILED (auth-mismatch): auth uid ${uid} != payload uid ${userId}`);
  }

  const safeName = file.name.replace(/\s+/g, "-");
  const objectRef = ref(
    storage,
    `users/${userId}/${folder}/${Date.now()}-${safeName}`
  );

  try {
    await uploadBytes(objectRef, file);
    return getDownloadURL(objectRef);
  } catch (error) {
    const code = (error as { code?: string })?.code || "unknown";
    const message = (error as { message?: string })?.message || "Unknown Storage error";
    throw new Error(`STORAGE_UPLOAD_FAILED (${code}): ${message}`);
  }
}
