import { NextResponse } from "next/server";
import crypto from "crypto";
import { getFirestoreDocServer, setFirestoreDocServer } from "@/lib/firebase-admin";
import { sendConnectionOtpEmail } from "@/lib/email/sendgrid";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const idToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : "";

    const body = await request.json();
    const { bookingId, customerEmail } = body;

    if (!bookingId || !customerEmail) {
      return NextResponse.json(
        { error: "Booking ID and Customer Email are required." },
        { status: 400 }
      );
    }

    const booking = await getFirestoreDocServer("bookings", bookingId, idToken);

    if (!booking) {
      return NextResponse.json(
        { error: "Booking record not found." },
        { status: 404 }
      );
    }

    if (booking.connectionStatus === "connected") {
      return NextResponse.json(
        { error: "Booking has already been verified and connected." },
        { status: 400 }
      );
    }

    // Generate new 6-digit OTP & SHA-256 hash
    const newRawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newHash = crypto.createHash("sha256").update(newRawOtp).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await setFirestoreDocServer(
      "bookings",
      bookingId,
      {
        connectionOtpHash: newHash,
        connectionOtpExpiresAt: expiresAt,
        connectionOtpAttempts: 0,
        connectionStatus: "waiting",
        updatedAt: new Date().toISOString(),
      },
      idToken
    );

    await sendConnectionOtpEmail({
      customerEmail,
      serviceName: booking.serviceName,
      providerName: booking.providerName,
      providerPhone: booking.providerPhone || "+91 98765 43210",
      date: booking.date,
      time: booking.time,
      connectionOtp: newRawOtp,
      expiresAtHours: 24,
    });

    return NextResponse.json({
      success: true,
      message: "New connection code generated and sent to customer's registered email.",
    });
  } catch (error: any) {
    console.error("Error regenerating connection OTP:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to resend connection code." },
      { status: 500 }
    );
  }
}
