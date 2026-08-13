import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { ProviderKyc, ProviderKycStatus } from "@/types/service-provider";

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
  decision: "approved" | "rejected" | "resubmission_required",
  reason?: string
): Promise<void> {
  const kycDocRef = doc(db, "providerKyc", uid);
  const providerDocRef = doc(db, "providers", uid);
  const now = new Date().toISOString();
  const adminUid = auth.currentUser?.uid || "admin";

  const updateData: Partial<ProviderKyc> = {
    status: decision,
    updatedAt: now,
  };

  if (decision === "approved") {
    updateData.verifiedAt = now;
    updateData.verifiedBy = adminUid;
  } else if (decision === "rejected") {
    updateData.rejectionReason = reason || "KYC documents did not meet verification criteria.";
    updateData.rejectedAt = now;
    updateData.rejectedBy = adminUid;
  } else if (decision === "resubmission_required") {
    updateData.resubmissionReason = reason || "Correction required for uploaded documents.";
    updateData.requestedAt = now;
    updateData.requestedBy = adminUid;
  }

  await updateDoc(kycDocRef, updateData);

  // Update kycStatus and providerStatus in providers/{uid}
  await setDoc(
    providerDocRef,
    {
      kycStatus: decision,
      providerStatus: decision === "approved" ? "active" : "pending",
      updatedAt: now,
    },
    { merge: true }
  );
}
