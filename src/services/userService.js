import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../config/firebase";

export const getUserProfile = async (userId) => {
  if (!isFirebaseConfigured || !userId) {
    return null;
  }

  const snapshot = await getDoc(doc(db, "users", userId));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const upsertVerifiedUser = async ({ id, name, mobile, upiId = "" }) => {
  const user = {
    id,
    name: name || `User ${mobile?.slice(-4) || ""}`.trim(),
    mobile,
    upiId,
    isMobileVerified: true,
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured) {
    return user;
  }

  const userRef = doc(db, "users", id);
  const existing = await getDoc(userRef);

  await setDoc(
    userRef,
    {
      ...user,
      createdAt: existing.exists()
        ? existing.data().createdAt || serverTimestamp()
        : serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return user;
};

export const updateUserProfile = async (userId, updates) => {
  if (!isFirebaseConfigured || !userId) {
    return { id: userId, ...updates };
  }

  await updateDoc(doc(db, "users", userId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  return getUserProfile(userId);
};
