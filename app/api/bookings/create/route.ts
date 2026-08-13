import { NextResponse } from "next/server";
import crypto from "crypto";
import { setFirestoreDocServer, getFirestoreDocServer, adminAuth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    // 1. Extract Bearer Token if present
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
    const {
      userId,
      customerName = "Valued Member",
      customerEmail,
      serviceId,
      serviceName,
      serviceImage,
      providerId,
      providerName,
      providerAvatar,
      date,
      time,
      duration = "2 Hours",
      amount = 49,
      stateId = "up",
      stateName = "Uttar Pradesh",
      cityId = "kanpur",
      cityName = "Kanpur",
      localityId = "panki",
      localityName = "Panki",
    } = body;

    const targetUserId = verifiedUid || userId;

    if (!targetUserId || !serviceName || !providerId) {
      return NextResponse.json(
        { error: "Missing required booking details or user authentication." },
        { status: 400 }
      );
    }

    // 2. Fetch provider contact number securely using server helper
    let providerPhone = "";
    if (serviceId) {
      try {
        const psData = await getFirestoreDocServer(
          "providerServices",
          `${providerId}_${serviceId}`,
          idToken
        );
        if (psData) {
          providerPhone = psData.contactNumber || "";
        }
      } catch (e) {
        console.warn("Could not fetch providerServices contact number:", e);
      }
    }

    if (!providerPhone) {
      try {
        const pData = await getFirestoreDocServer("providers", providerId, idToken);
        if (pData) {
          providerPhone = pData.phoneNumber || pData.mobileNumber || "";
        }
      } catch (e) {
        console.warn("Could not fetch provider mobile number:", e);
      }
    }

    if (!providerPhone) {
      providerPhone = "+91 98765 43210";
    }

    // 3. Generate secure 6-digit Connection OTP on SERVER
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const connectionOtpHash = crypto.createHash("sha256").update(rawOtp).digest("hex");

    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // 4. Save Booking document to Firestore using server helper
    const bookingDoc = {
      id: bookingId,
      userId: targetUserId,
      customerName,
      customerEmail: customerEmail || "",
      providerId,
      serviceId: serviceId || "service_default",
      serviceName,
      serviceImage: serviceImage || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
      providerName,
      providerAvatar: providerAvatar || "",
      providerPhone,
      date: date || new Date().toLocaleDateString(),
      time: time || "06:00 PM",
      duration,
      amount,
      stateId,
      stateName,
      cityId,
      cityName,
      localityId,
      localityName,
      status: "upcoming",
      paymentStatus: "paid",
      connectionStatus: "waiting",
      connectionOtp: rawOtp,
      connectionOtpHash,
      connectionOtpExpiresAt: expiresAt,
      connectionOtpAttempts: 0,
      connectionOtpUsed: false,
      createdAt: now,
    };

    await setFirestoreDocServer("bookings", bookingId, bookingDoc, idToken);

    // 5. Save Payment document to Firestore payments collection for Admin Payment Visibility
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const paymentDoc = {
      id: paymentId,
      bookingId,
      customerId: targetUserId,
      customerName,
      customerEmail: customerEmail || "",
      providerId,
      providerName,
      serviceId: serviceId || "service_default",
      serviceName,
      cityId,
      cityName,
      localityId,
      localityName,
      amount,
      currency: "INR",
      paymentStatus: "paid",
      paymentMethod: "demo",
      createdAt: now,
    };

    try {
      await setFirestoreDocServer("payments", paymentId, paymentDoc, idToken);
    } catch (e) {
      console.warn("Could not save payments record:", e);
    }

    return NextResponse.json({
      success: true,
      bookingId,
      paymentId,
      connectionOtp: rawOtp,
      providerPhone,
      message: "Booking created successfully. Connection OTP generated for dashboard verification.",
    });
  } catch (error: any) {
    console.error("Error creating booking & connection OTP:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error creating booking." },
      { status: 500 }
    );
  }
}
