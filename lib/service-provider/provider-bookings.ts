import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { ProviderBooking, BookingStatus } from "@/types/service-provider";

export async function getProviderBookings(providerId: string): Promise<ProviderBooking[]> {
  try {
    const q = query(collection(db, "bookings"), where("providerId", "==", providerId));
    const snapshot = await getDocs(q);
    const bookings: ProviderBooking[] = [];
    snapshot.forEach((docSnap) => {
      bookings.push({ id: docSnap.id, ...docSnap.data() } as ProviderBooking);
    });
    return bookings.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    console.warn("Could not fetch provider bookings from Firestore:", error);
    return [];
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus
): Promise<void> {
  const currentUser = auth.currentUser;
  let idToken = "";
  if (currentUser) {
    try {
      idToken = await currentUser.getIdToken();
    } catch (e) {
      console.warn("Could not get idToken for booking status update:", e);
    }
  }

  // Try API route first to bypass browser client permission restrictions
  try {
    const res = await fetch("/api/bookings/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify({ bookingId, status }),
    });

    if (res.ok) {
      return;
    }
  } catch (err) {
    console.warn("API route booking update failed, attempting client updateDoc:", err);
  }

  // Fallback to client-side updateDoc
  const docRef = doc(db, "bookings", bookingId);
  await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
}
