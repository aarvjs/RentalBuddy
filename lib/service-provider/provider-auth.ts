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
import { isValidLocation } from "@/lib/locations";

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
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : null;

    if (docSnap.exists()) {
      const pData = docSnap.data() as ProviderProfile;
      const userSavedLoc = userData?.customerLocation || userData?.location;
      const hasProvLoc = isValidLocation(pData.providerLocation || pData.location || pData);
      const hasUserLoc = isValidLocation(userSavedLoc || userData);

      // If provider doc lacks location but user doc has a saved location (especially for "both" users), inherit it
      if (!hasProvLoc && hasUserLoc && userData) {
        const locObj = userSavedLoc || {
          country: "India",
          state: userData.stateName || userData.state || "",
          city: userData.cityName || userData.city || "",
          locality: userData.localityName || userData.locality || "",
          address: `${userData.localityName || userData.locality || ""}, ${userData.cityName || userData.city || ""}`,
          pincode: userData.pincode || "",
          latitude: 26.4499,
          longitude: 80.3319,
          stateId: userData.stateId || "",
          stateName: userData.stateName || userData.state || "",
          cityId: userData.cityId || "",
          cityName: userData.cityName || userData.city || "",
          localityId: userData.localityId || "",
          localityName: userData.localityName || userData.locality || "",
        };

        const mergedProvider: ProviderProfile = {
          ...pData,
          city: pData.city || userData.city || locObj.city || "",
          state: pData.state || userData.state || locObj.state || "",
          pincode: pData.pincode || userData.pincode || locObj.pincode || "",
          stateId: pData.stateId || userData.stateId || locObj.stateId || "",
          stateName: pData.stateName || userData.stateName || locObj.stateName || "",
          cityId: pData.cityId || userData.cityId || locObj.cityId || "",
          cityName: pData.cityName || userData.cityName || locObj.cityName || "",
          localityId: pData.localityId || userData.localityId || locObj.localityId || "",
          localityName: pData.localityName || userData.localityName || locObj.localityName || "",
          locality: pData.locality || userData.locality || locObj.locality || "",
          providerLocation: pData.providerLocation || locObj,
          location: pData.location || locObj,
        };

        try {
          await setDoc(docRef, mergedProvider, { merge: true });
        } catch (e) {
          console.warn("Could not sync user location to providers/{uid}:", e);
        }

        return mergedProvider;
      }

      return pData;
    }

    if (userData && (userData.userType === "provider" || userData.userType === "both")) {
      const userSavedLoc = userData.customerLocation || userData.location;
      const hasUserLoc = isValidLocation(userSavedLoc || userData);
      const locObj = hasUserLoc
        ? userSavedLoc || {
            country: "India",
            state: userData.stateName || userData.state || "",
            city: userData.cityName || userData.city || "",
            locality: userData.localityName || userData.locality || "",
            address: `${userData.localityName || userData.locality || ""}, ${userData.cityName || userData.city || ""}`,
            pincode: userData.pincode || "",
            latitude: 26.4499,
            longitude: 80.3319,
            stateId: userData.stateId || "",
            stateName: userData.stateName || userData.state || "",
            cityId: userData.cityId || "",
            cityName: userData.cityName || userData.city || "",
            localityId: userData.localityId || "",
            localityName: userData.localityName || userData.locality || "",
          }
        : undefined;

      const newProviderDoc: ProviderProfile = {
        uid,
        fullName: userData.fullName || "Provider",
        email: userData.email || "",
        mobileNumber: userData.mobileNumber || "",
        city: userData.city || locObj?.city || "",
        state: userData.state || locObj?.state || "",
        pincode: userData.pincode || locObj?.pincode || "",
        stateId: userData.stateId || locObj?.stateId || "",
        stateName: userData.stateName || locObj?.stateName || "",
        cityId: userData.cityId || locObj?.cityId || "",
        cityName: userData.cityName || locObj?.cityName || "",
        localityId: userData.localityId || locObj?.localityId || "",
        localityName: userData.localityName || locObj?.localityName || "",
        locality: userData.locality || locObj?.locality || "",
        providerLocation: locObj,
        location: locObj,
        role: "provider",
        kycStatus: "pending",
        providerStatus: "pending",
        createdAt: userData.createdAt || new Date().toISOString(),
        photoURL: userData.photoURL || undefined,
      };

      try {
        await setDoc(docRef, newProviderDoc);
      } catch (e) {
        console.warn("Could not auto-create providers/{uid} document:", e);
      }

      return newProviderDoc;
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
