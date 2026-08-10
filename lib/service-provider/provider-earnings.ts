import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EarningsSummary, WithdrawalRecord, ProviderBooking } from "@/types/service-provider";

export async function getProviderEarningsSummary(providerId: string): Promise<EarningsSummary> {
  try {
    const q = query(collection(db, "bookings"), where("providerId", "==", providerId));
    const snapshot = await getDocs(q);
    
    let totalEarnings = 0;
    let pendingEarnings = 0;
    let completedServicesCount = 0;

    snapshot.forEach((docSnap) => {
      const b = docSnap.data() as ProviderBooking;
      if (b.status === "completed") {
        totalEarnings += Number(b.amount) || 0;
        completedServicesCount += 1;
      } else if (b.status === "upcoming" || b.status === "pending") {
        pendingEarnings += Number(b.amount) || 0;
      }
    });

    // Fetch withdrawals to deduct processed withdrawals from available balance
    const withdrawalsQuery = query(collection(db, "withdrawals"), where("providerId", "==", providerId));
    const withdrawalsSnap = await getDocs(withdrawalsQuery);
    let totalWithdrawn = 0;
    withdrawalsSnap.forEach((wSnap) => {
      const w = wSnap.data() as WithdrawalRecord;
      if (w.status === "processed" || w.status === "pending") {
        totalWithdrawn += Number(w.amount) || 0;
      }
    });

    const availableBalance = Math.max(0, totalEarnings - totalWithdrawn);

    return {
      totalEarnings,
      availableBalance,
      pendingEarnings,
      completedServicesCount,
    };
  } catch (error) {
    console.warn("Could not calculate provider earnings summary:", error);
    return {
      totalEarnings: 0,
      availableBalance: 0,
      pendingEarnings: 0,
      completedServicesCount: 0,
    };
  }
}

export async function requestWithdrawal(
  providerId: string,
  amount: number,
  bankDetails: { accountNumber: string; ifscCode: string; bankName: string; accountHolderName: string }
): Promise<WithdrawalRecord> {
  const withdrawalId = `wdr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: WithdrawalRecord = {
    id: withdrawalId,
    providerId,
    amount,
    accountNumber: bankDetails.accountNumber.trim(),
    ifscCode: bankDetails.ifscCode.trim(),
    bankName: bankDetails.bankName.trim(),
    accountHolderName: bankDetails.accountHolderName.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "withdrawals", withdrawalId), record);
  return record;
}

export async function getProviderWithdrawals(providerId: string): Promise<WithdrawalRecord[]> {
  try {
    const q = query(collection(db, "withdrawals"), where("providerId", "==", providerId));
    const snapshot = await getDocs(q);
    const list: WithdrawalRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as WithdrawalRecord);
    });
    return list;
  } catch (error) {
    console.warn("Could not fetch withdrawals:", error);
    return [];
  }
}
