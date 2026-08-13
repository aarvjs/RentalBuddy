import { NextResponse } from "next/server";
import crypto from "crypto";
import { getFirestoreDocServer, setFirestoreDocServer } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const idToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : "";

    const body = await request.json();
    const { bookingId, otp, providerId } = body;

    if (!bookingId || !otp || !providerId) {
      return NextResponse.json(
        { error: "Booking ID, OTP, and Provider ID are required." },
        { status: 400 }
      );
    }

    const cleanOtp = otp.toString().trim();
    if (cleanOtp.length !== 6) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit connection code." },
        { status: 400 }
      );
    }

    // 1. Retrieve booking from Firestore using server helper
    const booking = await getFirestoreDocServer("bookings", bookingId, idToken);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking record not found." },
        { status: 404 }
      );
    }

    // 2. Verify assigned provider
    if (booking.providerId !== providerId) {
      return NextResponse.json(
        { error: "Unauthorized. You can only verify bookings assigned to you." },
        { status: 403 }
      );
    }

    // 3. Verify paymentStatus === "paid"
    if (booking.paymentStatus !== "paid") {
      return NextResponse.json(
        { error: "Connection verification requires a paid booking." },
        { status: 400 }
      );
    }

    // 4. Verify connectionStatus !== "connected"
    if (booking.connectionStatus === "connected" || booking.connectionOtpUsed) {
      return NextResponse.json(
        { error: "This service connection has already been verified and connected." },
        { status: 400 }
      );
    }

    // 5. Check expiration
    if (booking.connectionOtpExpiresAt) {
      const expiresAt = new Date(booking.connectionOtpExpiresAt).getTime();
      if (Date.now() > expiresAt) {
        return NextResponse.json(
          { error: "Connection code has expired. Please ask customer to request a new code." },
          { status: 400 }
        );
      }
    }

    // 6. Check attempts limit (max 5)
    const currentAttempts = booking.connectionOtpAttempts || 0;
    if (currentAttempts >= 5) {
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please ask the customer to request a new connection code." },
        { status: 429 }
      );
    }

    // 7. Compute SHA-256 hash of submitted OTP and compare
    const submittedHash = crypto.createHash("sha256").update(cleanOtp).digest("hex");

    const isValidOtp =
      submittedHash === booking.connectionOtpHash ||
      cleanOtp === booking.connectionOtp;

    if (!isValidOtp) {
      // Increment failed attempts count
      await setFirestoreDocServer(
        "bookings",
        bookingId,
        {
          connectionOtpAttempts: currentAttempts + 1,
          updatedAt: new Date().toISOString(),
        },
        idToken
      );

      return NextResponse.json(
        {
          error: "Invalid connection code. Please enter the 6-digit OTP displayed on the customer dashboard.",
          attemptsLeft: 5 - (currentAttempts + 1),
        },
        { status: 400 }
      );
    }

    // 8. Success: Update booking status to connected
    const now = new Date().toISOString();
    await setFirestoreDocServer(
      "bookings",
      bookingId,
      {
        connectionStatus: "connected",
        connectionOtpUsed: true,
        connectedAt: now,
        connectionVerifiedBy: providerId,
        updatedAt: now,
      },
      idToken
    );

    return NextResponse.json({
      success: true,
      message: "Connection Verified ✓",
      connectedAt: now,
    });
  } catch (error: any) {
    console.error("Error verifying connection OTP:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error verifying connection code." },
      { status: 500 }
    );
  }
}
