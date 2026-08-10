import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { db, storage, auth } from "@/lib/firebase";
import { ProviderProfile } from "@/types/service-provider";

export async function updateProviderProfileData(
  uid: string,
  data: Partial<ProviderProfile>
): Promise<void> {
  const docRef = doc(db, "providers", uid);
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  if (data.fullName && auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, { displayName: data.fullName });
    } catch (e) {
      console.warn("Could not update auth display name:", e);
    }
  }
}

export async function uploadProviderAvatar(uid: string, file: File): Promise<string> {
  const sanitizeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storageRef = ref(storage, `provider_avatars/${uid}/${Date.now()}_${sanitizeFilename}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  // Update providers/{uid} document
  try {
    const docRef = doc(db, "providers", uid);
    await setDoc(docRef, { photoURL: downloadURL, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn("Could not update photoURL in providers document:", e);
  }

  // Update users/{uid} document
  try {
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, { photoURL: downloadURL, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn("Could not update photoURL in users document:", e);
  }

  if (auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
    } catch (e) {
      console.warn("Could not update auth photo URL:", e);
    }
  }

  return downloadURL;
}
