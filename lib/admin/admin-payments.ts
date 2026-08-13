import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { WithdrawalRecord } from "@/types/service-provider";

export interface CustomerPaymentRecord {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  cityId?: string;
  cityName?: string;
  localityId?: string;
  localityName?: string;
  amount: number;
  currency?: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
}

export async function getAllCustomerPaymentsAdmin(): Promise<CustomerPaymentRecord[]> {
  try {
    const snapshot = await getDocs(collection(db, "payments"));
    const list: CustomerPaymentRecord[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as CustomerPaymentRecord);
    });
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    console.warn("Could not fetch customer payments for admin:", error);
    return [];
  }
}

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
