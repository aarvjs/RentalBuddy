import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { ProviderKyc } from "@/types/service-provider";

export interface SubmitKycInput {
  fullName: string;
  mobileNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  aadhaarNumber: string;
  profilePhotoFile: File | null;
  aadhaarFrontFile: File | null;
  aadhaarBackFile: File | null;
  existingProfilePhotoUrl?: string;
  existingAadhaarFrontUrl?: string;
  existingAadhaarBackUrl?: string;
}

export async function submitProviderKyc(uid: string, input: SubmitKycInput): Promise<ProviderKyc> {
  let profilePhotoUrl = input.existingProfilePhotoUrl || "";
  let aadhaarFrontUrl = input.existingAadhaarFrontUrl || "";
  let aadhaarBackUrl = input.existingAadhaarBackUrl || "";

  if (input.profilePhotoFile) {
    const photoRef = ref(storage, `provider_kyc/${uid}/profile_${Date.now()}_${input.profilePhotoFile.name}`);
    await uploadBytes(photoRef, input.profilePhotoFile);
    profilePhotoUrl = await getDownloadURL(photoRef);
  }

  if (input.aadhaarFrontFile) {
    const frontRef = ref(storage, `provider_kyc/${uid}/aadhaar_front_${Date.now()}_${input.aadhaarFrontFile.name}`);
    await uploadBytes(frontRef, input.aadhaarFrontFile);
    aadhaarFrontUrl = await getDownloadURL(frontRef);
  }

  if (input.aadhaarBackFile) {
    const backRef = ref(storage, `provider_kyc/${uid}/aadhaar_back_${Date.now()}_${input.aadhaarBackFile.name}`);
    await uploadBytes(backRef, input.aadhaarBackFile);
    aadhaarBackUrl = await getDownloadURL(backRef);
  }

  const kycDoc: ProviderKyc = {
    uid,
    profilePhoto: profilePhotoUrl,
    fullName: input.fullName.trim(),
    mobileNumber: input.mobileNumber.trim(),
    address: input.address.trim(),
    city: input.city.trim(),
    state: input.state.trim(),
    pincode: input.pincode.trim(),
    aadhaarNumber: input.aadhaarNumber.trim(),
    aadhaarFrontUrl,
    aadhaarBackUrl,
    status: "pending",
    submittedAt: new Date().toISOString(),
  };

  // Save document to providerKyc/{uid}
  await setDoc(doc(db, "providerKyc", uid), kycDoc);

  // Update status in providers/{uid}
  await setDoc(
    doc(db, "providers", uid),
    {
      kycStatus: "pending",
      photoURL: profilePhotoUrl || undefined,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return kycDoc;
}

export async function getProviderKyc(uid: string): Promise<ProviderKyc | null> {
  try {
    const docRef = doc(db, "providerKyc", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ProviderKyc;
    }
    return null;
  } catch (error) {
    console.warn("Error fetching provider KYC from Firestore:", error);
    return null;
  }
}
