import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { ProviderKyc } from "@/types/service-provider";

export interface SubmitKycInput {
  fullName: string;
  mobileNumber: string;
  dob?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  aadhaarNumber: string;
  profilePhotoFile: File | null;
  aadhaarFrontFile: File | null;
  aadhaarBackFile: File | null;
  addressProofFile?: File | null;
  existingProfilePhotoUrl?: string;
  existingAadhaarFrontUrl?: string;
  existingAadhaarBackUrl?: string;
  existingAddressProofUrl?: string;
  phoneVerified?: boolean;
  phoneVerifiedAt?: string;
}

export async function markPhoneAsVerified(uid: string, phoneNumber: string): Promise<void> {
  const now = new Date().toISOString();
  const providerRef = doc(db, "providers", uid);
  await setDoc(
    providerRef,
    {
      phoneNumber: phoneNumber.trim(),
      mobileNumber: phoneNumber.trim(),
      phoneVerified: true,
      phoneVerifiedAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  const kycRef = doc(db, "providerKyc", uid);
  const kycSnap = await getDoc(kycRef);
  if (kycSnap.exists()) {
    await updateDoc(kycRef, {
      phoneNumber: phoneNumber.trim(),
      mobileNumber: phoneNumber.trim(),
      phoneVerified: true,
      phoneVerifiedAt: now,
      updatedAt: now,
    });
  }
}

export async function submitProviderKyc(uid: string, input: SubmitKycInput): Promise<ProviderKyc> {
  let profilePhotoUrl = input.existingProfilePhotoUrl || "";
  let aadhaarFrontUrl = input.existingAadhaarFrontUrl || "";
  let aadhaarBackUrl = input.existingAadhaarBackUrl || "";
  let addressProofUrl = input.existingAddressProofUrl || "";

  const timestamp = Date.now();

  if (input.profilePhotoFile) {
    const photoRef = ref(storage, `kyc/${uid}/profile-photo_${timestamp}_${input.profilePhotoFile.name}`);
    await uploadBytes(photoRef, input.profilePhotoFile);
    profilePhotoUrl = await getDownloadURL(photoRef);
  }

  if (input.aadhaarFrontFile) {
    const frontRef = ref(storage, `kyc/${uid}/aadhaar-front_${timestamp}_${input.aadhaarFrontFile.name}`);
    await uploadBytes(frontRef, input.aadhaarFrontFile);
    aadhaarFrontUrl = await getDownloadURL(frontRef);
  }

  if (input.aadhaarBackFile) {
    const backRef = ref(storage, `kyc/${uid}/aadhaar-back_${timestamp}_${input.aadhaarBackFile.name}`);
    await uploadBytes(backRef, input.aadhaarBackFile);
    aadhaarBackUrl = await getDownloadURL(backRef);
  }

  if (input.addressProofFile) {
    const proofRef = ref(storage, `kyc/${uid}/address-proof_${timestamp}_${input.addressProofFile.name}`);
    await uploadBytes(proofRef, input.addressProofFile);
    addressProofUrl = await getDownloadURL(proofRef);
  }

  const now = new Date().toISOString();
  const cleanMobile = input.mobileNumber.trim();

  const kycDoc: ProviderKyc = {
    uid,
    providerId: uid,
    profilePhoto: profilePhotoUrl,
    profilePhotoUrl: profilePhotoUrl,
    fullName: input.fullName.trim(),
    mobileNumber: cleanMobile,
    phoneNumber: cleanMobile,
    phoneVerified: input.phoneVerified ?? true,
    phoneVerifiedAt: input.phoneVerifiedAt || now,
    dob: input.dob ? input.dob.trim() : "",
    address: input.address.trim(),
    city: input.city.trim(),
    state: input.state.trim(),
    pincode: input.pincode.trim(),
    aadhaarNumber: input.aadhaarNumber.trim(),
    aadhaarFrontUrl,
    aadhaarBackUrl,
    addressProofUrl,
    status: "pending",
    submittedAt: now,
    updatedAt: now,
  };

  // Save document to providerKyc/{uid}
  await setDoc(doc(db, "providerKyc", uid), kycDoc);

  // Update status in providers/{uid}
  await setDoc(
    doc(db, "providers", uid),
    {
      phoneNumber: cleanMobile,
      mobileNumber: cleanMobile,
      phoneVerified: input.phoneVerified ?? true,
      phoneVerifiedAt: input.phoneVerifiedAt || now,
      kycStatus: "pending",
      photoURL: profilePhotoUrl || undefined,
      updatedAt: now,
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
