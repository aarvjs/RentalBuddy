import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface AdminInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  occasion?: string;
  destination?: string;
  notes?: string;
  status: "new" | "contacted" | "resolved";
  createdAt: string;
  updatedAt?: string;
}

export async function getAllInquiriesAdmin(): Promise<AdminInquiry[]> {
  try {
    const snapshot = await getDocs(collection(db, "inquiries"));
    const list: AdminInquiry[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as AdminInquiry);
    });
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    console.warn("Could not fetch inquiries for admin:", error);
    return [];
  }
}

export async function updateInquiryStatusAdmin(
  inquiryId: string,
  status: "new" | "contacted" | "resolved"
): Promise<void> {
  const docRef = doc(db, "inquiries", inquiryId);
  await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
}

export async function deleteInquiryAdmin(inquiryId: string): Promise<void> {
  const docRef = doc(db, "inquiries", inquiryId);
  await deleteDoc(docRef);
}
