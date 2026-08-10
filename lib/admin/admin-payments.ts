import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { WithdrawalRecord } from "@/types/service-provider";

export async function getAllWithdrawalsAdmin(): Promise<WithdrawalRecord[]> {
  try {
    const snapshot = await getDocs(collection(db, "withdrawals"));
    const list: WithdrawalRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as WithdrawalRecord);
    });
    return list;
  } catch (error) {
    console.warn("Could not fetch withdrawals for admin:", error);
    return [];
  }
}

export async function updateWithdrawalStatusAdmin(
  withdrawalId: string,
  status: "pending" | "processed" | "rejected"
): Promise<void> {
  const docRef = doc(db, "withdrawals", withdrawalId);
  await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
}
