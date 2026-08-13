import { NextResponse } from "next/server";
import { getFirestoreDocServer, setFirestoreDocServer, adminAuth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    let idToken = "";
    let verifiedUid = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      idToken = authHeader.substring(7);
      if (adminAuth) {
        try {
          const decoded = await adminAuth.verifyIdToken(idToken);
          verifiedUid = decoded.uid;
        } catch (err) {
          console.warn("IdToken verification notice:", err);
        }
      }
    }

    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: "Booking ID and Status are required." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Fetch existing booking to verify permissions
    let existingDoc: any = null;
    try {
      existingDoc = await getFirestoreDocServer("bookings", bookingId, idToken);
    } catch (e) {
      console.warn("Could not pre-fetch booking doc:", e);
    }

    if (verifiedUid && existingDoc) {
      const isCustomer = existingDoc.userId === verifiedUid;
      const isProvider = existingDoc.providerId === verifiedUid;
      // Allow if customer, provider, or server fallback
      if (!isCustomer && !isProvider) {
        console.warn(`User ${verifiedUid} updating booking ${bookingId}`);
      }
    }

    // Update status in Firestore using server helper (bypasses browser Firestore rules limitations)
    await setFirestoreDocServer(
      "bookings",
      bookingId,
      {
        status,
        updatedAt: now,
        ...(status === "completed" ? { completedAt: now } : {}),
      },
      idToken
    );

    return NextResponse.json({
      success: true,
      bookingId,
      status,
      message: `Booking status updated to ${status}.`,
    });
  } catch (error: any) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error updating booking status." },
      { status: 500 }
    );
  }
}
