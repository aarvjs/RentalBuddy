import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProviderKyc } from "@/types/service-provider";

export async function getAllKycSubmissions(): Promise<ProviderKyc[]> {
  try {
    const snapshot = await getDocs(collection(db, "providerKyc"));
    const list: ProviderKyc[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ uid: docSnap.id, ...docSnap.data() } as ProviderKyc);
    });
    return list;
  } catch (error) {
    console.warn("Could not fetch KYC submissions:", error);
    return [];
  }
}

export async function reviewProviderKyc(
  uid: string,
  decision: "approved" | "rejected",
  rejectionReason?: string
): Promise<void> {
  const kycDocRef = doc(db, "providerKyc", uid);
  const providerDocRef = doc(db, "providers", uid);

  const updateData: Partial<ProviderKyc> = {
    status: decision,
    rejectionReason: decision === "rejected" ? rejectionReason || "KYC documents did not meet requirements." : undefined,
  };

  await updateDoc(kycDocRef, updateData);

  // Update kycStatus and providerStatus in providers/{uid}
  await updateDoc(providerDocRef, {
    kycStatus: decision,
    providerStatus: decision === "approved" ? "active" : "pending",
    updatedAt: new Date().toISOString(),
  });
}
