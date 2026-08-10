import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProviderService, ServiceStatus } from "@/types/service-provider";

export async function getAllServicesAdmin(): Promise<ProviderService[]> {
  try {
    const snapshot = await getDocs(collection(db, "services"));
    const list: ProviderService[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as ProviderService);
    });
    return list;
  } catch (error) {
    console.warn("Could not fetch services for admin:", error);
    return [];
  }
}

export async function updateServiceStatusAdmin(
  serviceId: string,
  status: ServiceStatus
): Promise<void> {
  const docRef = doc(db, "services", serviceId);
  await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
}
