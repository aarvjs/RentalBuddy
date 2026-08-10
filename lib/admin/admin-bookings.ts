import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProviderBooking, BookingStatus } from "@/types/service-provider";

export async function getAllBookingsAdmin(): Promise<ProviderBooking[]> {
  try {
    const snapshot = await getDocs(collection(db, "bookings"));
    const list: ProviderBooking[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as ProviderBooking);
    });
    return list;
  } catch (error) {
    console.warn("Could not fetch bookings for admin:", error);
    return [];
  }
}

export async function updateBookingStatusAdmin(
  bookingId: string,
  status: BookingStatus
): Promise<void> {
  const docRef = doc(db, "bookings", bookingId);
  await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
}
