import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminProviderListItem } from "@/types/admin";
import { ProviderAccountStatus } from "@/types/service-provider";

export async function getAllProviders(): Promise<AdminProviderListItem[]> {
  try {
    // Fetch all admin UIDs to ensure admin accounts are excluded
    const adminsSnapshot = await getDocs(collection(db, "admins"));
    const adminUids = new Set<string>();
    adminsSnapshot.forEach((docSnap) => {
      adminUids.add(docSnap.id);
    });

    const snapshot = await getDocs(collection(db, "providers"));
    const list: AdminProviderListItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const uid = docSnap.id;
      if (adminUids.has(uid) || data?.role === "admin") {
        return;
      }
      list.push({ uid, ...data } as AdminProviderListItem);
    });
    return list;
  } catch (error) {
    console.warn("Could not fetch providers list:", error);
    return [];
  }
}

export async function getProviderDetails(uid: string): Promise<AdminProviderListItem | null> {
  try {
    const docRef = doc(db, "providers", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() } as AdminProviderListItem;
    }
    return null;
  } catch (error) {
    console.warn("Could not fetch provider details:", error);
    return null;
  }
}

export async function updateProviderStatus(
  uid: string,
  providerStatus: ProviderAccountStatus
): Promise<void> {
  const docRef = doc(db, "providers", uid);
  await updateDoc(docRef, { providerStatus, updatedAt: new Date().toISOString() });
}
