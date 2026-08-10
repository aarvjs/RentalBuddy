import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProviderBooking, BookingStatus } from "@/types/service-provider";

export async function getProviderBookings(providerId: string): Promise<ProviderBooking[]> {
  try {
    const q = query(collection(db, "bookings"), where("providerId", "==", providerId));
    const snapshot = await getDocs(q);
    const bookings: ProviderBooking[] = [];
    snapshot.forEach((docSnap) => {
      bookings.push({ id: docSnap.id, ...docSnap.data() } as ProviderBooking);
    });
    return bookings;
  } catch (error) {
    console.warn("Could not fetch provider bookings from Firestore:", error);
    return [];
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<void> {
  const docRef = doc(db, "bookings", bookingId);
  await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
}
