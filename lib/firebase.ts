import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAl_qOyJ3GlbUWwv9l83Kb_1QG8GJ7_YO0",
  authDomain: "rentbuddy-23ba6.firebaseapp.com",
  projectId: "rentbuddy-23ba6",
  storageBucket: "rentbuddy-23ba6.firebasestorage.app",
  messagingSenderId: "575762553672",
  appId: "1:575762553672:web:6d6880aea13e1d7a5df17d",
  measurementId: "G-8W0GW0FJQB",
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export interface UserProfileData {
  uid: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  city: string;
  state?: string;
  pincode?: string;
  gender?: string;
  userType: "customer" | "provider" | "both";
  partnerPreference?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BookingData {
  id: string;
  userId: string;
  serviceId?: string;
  serviceName: string;
  serviceImage: string;
  providerName: string;
  providerAvatar?: string;
  date: string;
  time: string;
  duration: string;
  amount: number;
  status: "upcoming" | "completed" | "cancelled";
  createdAt: string;
}

export interface CustomerRegisterInput {
  fullName: string;
  email: string;
  password: string;
  city: string;
  gender: string;
  preference?: "Find a Partner" | "Become a Partner" | "Both";
  mobileNumber?: string;
  pincode?: string;
}

export interface ProviderRegisterInput {
  fullName: string;
  email: string;
  password: string;
  mobileNumber: string;
  city: string;
  state: string;
  pincode: string;
}

// Register Customer user
export async function registerCustomerUser(input: CustomerRegisterInput): Promise<User> {
  const { email, password, fullName, city, gender, preference, mobileNumber, pincode } = input;
  const cleanEmail = email.trim().toLowerCase();

  const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const user = userCredential.user;

  try {
    await updateProfile(user, { displayName: fullName.trim() });
  } catch (e) {
    console.warn("Could not update auth display name:", e);
  }

  try {
    const profileData: UserProfileData = {
      uid: user.uid,
      fullName: fullName.trim(),
      email: cleanEmail,
      mobileNumber: mobileNumber?.trim() || "",
      city: city.trim(),
      pincode: pincode?.trim() || "",
      gender: gender || "",
      userType: "customer",
      partnerPreference: preference || "Find a Partner",
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", user.uid), profileData);
  } catch (e) {
    console.warn("Could not save customer profile to Firestore:", e);
  }

  return user;
}

// Register Service Provider account
export async function registerProviderAccount(input: ProviderRegisterInput): Promise<User> {
  const { email, password, fullName, mobileNumber, city, state, pincode } = input;
  const cleanEmail = email.trim().toLowerCase();

  const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const user = userCredential.user;

  try {
    await updateProfile(user, { displayName: fullName.trim() });
  } catch (e) {
    console.warn("Could not update auth display name:", e);
  }

  const createdAt = new Date().toISOString();

  // 1. Create users/{uid} document
  try {
    const userDoc: UserProfileData = {
      uid: user.uid,
      fullName: fullName.trim(),
      email: cleanEmail,
      mobileNumber: mobileNumber.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      userType: "provider",
      createdAt,
    };
    await setDoc(doc(db, "users", user.uid), userDoc);
  } catch (e) {
    console.warn("Could not save user profile document:", e);
  }

  // 2. Create providers/{uid} document
  try {
    const providerDoc = {
      uid: user.uid,
      fullName: fullName.trim(),
      email: cleanEmail,
      mobileNumber: mobileNumber.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      role: "provider",
      kycStatus: "pending",
      providerStatus: "pending",
      createdAt,
    };
    await setDoc(doc(db, "providers", user.uid), providerDoc);
  } catch (e) {
    console.warn("Could not save provider document:", e);
  }

  return user;
}

// Legacy registerUser helper (defaults to Customer)
export async function registerUser(input: CustomerRegisterInput): Promise<User> {
  return registerCustomerUser(input);
}

// Login with Email & Password
export async function loginUser(email: string, password: string): Promise<User> {
  const cleanEmail = email.trim().toLowerCase();
  const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
  return userCredential.user;
}

// Logout
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Reset Password
export async function resetPassword(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  await sendPasswordResetEmail(auth, cleanEmail);
}

// Fetch Profile from Firestore users/{uid}
export async function getUserProfile(uid: string): Promise<UserProfileData | null> {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    console.warn("Error fetching user profile from Firestore:", error);
    return null;
  }
}

// Upload Profile Image to Firebase Storage & update Firestore
export async function uploadProfileImage(uid: string, file: File): Promise<string> {
  const sanitizeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storageRef = ref(storage, `profile_images/${uid}/${Date.now()}_${sanitizeFilename}`);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  try {
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, { photoURL: downloadURL, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn("Could not merge photoURL to users collection in Firestore:", e);
  }

  try {
    const providerDocRef = doc(db, "providers", uid);
    await setDoc(providerDocRef, { photoURL: downloadURL, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn("Could not merge photoURL to providers collection in Firestore:", e);
  }

  if (auth.currentUser) {
    try {
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
    } catch (e) {
      console.warn("Could not update auth photoURL:", e);
    }
  }

  return downloadURL;
}

// Fetch user bookings from Firestore
export async function getUserBookings(uid: string): Promise<BookingData[]> {
  try {
    const q = query(collection(db, "bookings"), where("userId", "==", uid));
    const querySnapshot = await getDocs(q);
    const bookings: BookingData[] = [];
    querySnapshot.forEach((docSnap) => {
      bookings.push({ id: docSnap.id, ...docSnap.data() } as BookingData);
    });
    return bookings;
  } catch (error) {
    console.warn("Could not fetch user bookings from Firestore:", error);
    return [];
  }
}
