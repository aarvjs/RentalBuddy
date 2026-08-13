import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { AdminProfile } from "@/types/admin";

export interface RegisterAdminInput {
  fullName: string;
  mobileNumber: string;
  email: string;
  password: string;
}

// 1. Admin Registration: Creates Firebase Auth account and writes admins/{uid} document strictly in Firestore
export async function registerAdminAccount(input: RegisterAdminInput): Promise<User> {
  const { fullName, mobileNumber, email, password } = input;
  const cleanEmail = email.trim().toLowerCase();

  // Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const user = userCredential.user;

  try {
    await updateProfile(user, { displayName: fullName.trim() });
  } catch (e) {
    console.warn("Could not update auth display name:", e);
  }

  const createdAt = new Date().toISOString();

  // Save admin document strictly in Firestore: admins/{uid} (Password is NOT stored in Firestore)
  const adminDoc: AdminProfile = {
    uid: user.uid,
    name: fullName.trim(),
    fullName: fullName.trim(),
    email: cleanEmail,
    mobile: mobileNumber.trim(),
    mobileNumber: mobileNumber.trim(),
    role: "admin",
    status: "active",
    createdAt,
  };
  await setDoc(doc(db, "admins", user.uid), adminDoc);

  return user;
}

// 2. Admin Login: Authenticates via Firebase Auth, gets UID, and checks admins/{uid} role === "admin"
export async function loginAdminAccount(email: string, password: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();

  // Firebase Authentication
  const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
  const user = userCredential.user;

  // Check admins/{uid} in Firestore
  const adminDocRef = doc(db, "admins", user.uid);
  const adminSnap = await getDoc(adminDocRef);

  if (!adminSnap.exists() || adminSnap.data()?.role !== "admin") {
    await signOut(auth);
    throw new Error("You are not authorized to access the Admin Panel.");
  }

  if (adminSnap.data()?.status === "suspended") {
    await signOut(auth);
    throw new Error("This Admin account has been suspended.");
  }

  return user;
}

// 3. Fetch Admin profile document from Firestore admins/{uid}
export async function getAdminProfile(uid: string): Promise<AdminProfile | null> {
  try {
    const docRef = doc(db, "admins", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data()?.role === "admin") {
      const data = docSnap.data();
      return {
        uid: docSnap.id,
        name: data.name || data.fullName || "",
        fullName: data.fullName || data.name || "",
        email: data.email || "",
        mobile: data.mobile || data.mobileNumber || "",
        mobileNumber: data.mobileNumber || data.mobile || "",
        role: "admin",
        status: data.status || "active",
        createdAt: data.createdAt || "",
        updatedAt: data.updatedAt,
      };
    }
    return null;
  } catch (error) {
    console.warn("Error fetching admin profile from Firestore:", error);
    return null;
  }
}

// 4. Fetch all Admin accounts from admins collection
export async function getAllAdmins(): Promise<AdminProfile[]> {
  try {
    const snapshot = await getDocs(collection(db, "admins"));
    const list: AdminProfile[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data?.role === "admin") {
        list.push({
          uid: docSnap.id,
          name: data.name || data.fullName || "",
          fullName: data.fullName || data.name || "",
          email: data.email || "",
          mobile: data.mobile || data.mobileNumber || "",
          mobileNumber: data.mobileNumber || data.mobile || "",
          role: "admin",
          status: data.status || "active",
          createdAt: data.createdAt || "",
          updatedAt: data.updatedAt,
        });
      }
    });
    return list;
  } catch (error) {
    console.warn("Could not fetch admins list:", error);
    return [];
  }
}

// 5. Send Password Reset Email using Firebase Auth
export async function resetAdminPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase());
}

// 6. Logout Admin
export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}
