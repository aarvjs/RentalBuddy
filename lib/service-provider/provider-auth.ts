import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ProviderProfile } from "@/types/service-provider";

export interface RegisterProviderInput {
  fullName: string;
  email: string;
  password: string;
  mobileNumber: string;
}

export async function registerProvider(input: RegisterProviderInput): Promise<User> {
  const { email, password, fullName, mobileNumber } = input;
  const cleanEmail = email.trim().toLowerCase();

  const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const user = userCredential.user;

  try {
    await updateProfile(user, { displayName: fullName.trim() });
  } catch (e) {
    console.warn("Could not update auth display name:", e);
  }

  const providerDoc: ProviderProfile = {
    uid: user.uid,
    fullName: fullName.trim(),
    email: cleanEmail,
    mobileNumber: mobileNumber.trim(),
    role: "provider",
    kycStatus: "pending",
    providerStatus: "pending",
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "providers", user.uid), providerDoc);
  return user;
}

export async function loginProvider(email: string, password: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
  return userCredential.user;
}

export async function getProviderProfile(uid: string): Promise<ProviderProfile | null> {
  try {
    const docRef = doc(db, "providers", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ProviderProfile;
    }
    return null;
  } catch (error) {
    console.warn("Error fetching provider profile from Firestore:", error);
    return null;
  }
}

export async function logoutProvider(): Promise<void> {
  await signOut(auth);
}
