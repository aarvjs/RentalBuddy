export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import {
  setFirestoreDocServer,
  getFirestoreDocServer,
  verifyServerIdToken,
} from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    let verifiedUid = "";
    let idToken = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      idToken = authHeader.substring(7);
      const verified = await verifyServerIdToken(idToken);
      if (verified) {
        verifiedUid = verified.uid;
      }
    }

    const body = await request.json().catch(() => ({}));
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId: incomingPaymentId,
      bookingDraft,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_SIGNATURE_DETAILS",
            message: "Missing Razorpay order ID, payment ID, or signature.",
          },
        },
        { status: 400 }
      );
    }

    // 1. Cryptographically verify signature with RAZORPAY_KEY_SECRET
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "SIGNATURE_VERIFICATION_FAILED",
            message: "Invalid transaction signature. Potential tampering detected.",
          },
        },
        { status: 400 }
      );
    }

    // 2. Extract booking draft details
    const draft = bookingDraft || {};
    const targetUserId = verifiedUid || draft.userId;
    const providerId = draft.providerId;
    const serviceId = draft.serviceId || "service_default";

    if (!targetUserId || !providerId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_BOOKING_DATA",
            message: "Missing essential companion booking parameters.",
          },
        },
        { status: 400 }
      );
    }

    // 3. Fetch Provider Phone number securely
    let providerPhone = "";
    if (serviceId) {
      try {
        const psData = await getFirestoreDocServer(
          "providerServices",
          `${providerId}_${serviceId}`,
          idToken
        );
        if (psData?.contactNumber) {
          providerPhone = psData.contactNumber;
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
        console.warn("Could not fetch provider phone:", e);
      }
    }

    if (!providerPhone) {
      providerPhone = "+91 98765 43210";
    }

    // 4. Generate secure 6-digit Connection OTP on SERVER
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const connectionOtpHash = crypto.createHash("sha256").update(rawOtp).digest("hex");

    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // 5. Save confirmed Booking document in Firestore
    const bookingDoc = {
      id: bookingId,
      userId: targetUserId,
      customerName: draft.customerName || "Valued Member",
      customerEmail: draft.customerEmail || "",
      providerId,
      serviceId,
      serviceName: draft.serviceName || "Companion Service",
      serviceImage:
        draft.serviceImage ||
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
      providerName: draft.providerName || "Companion",
      providerAvatar: draft.providerAvatar || "",
      providerPhone,
      date: draft.date || new Date().toLocaleDateString(),
      time: draft.time || "06:00 PM",
      duration: draft.duration || "2 Hours",
      amount: Number(draft.amount) || 0,
      stateId: draft.stateId || "up",
      stateName: draft.stateName || "Uttar Pradesh",
      cityId: draft.cityId || "kanpur",
      cityName: draft.cityName || "Kanpur",
      localityId: draft.localityId || "panki",
      localityName: draft.localityName || "Panki",
      status: "upcoming",
      paymentStatus: "paid",
      paymentMethod: "razorpay",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      connectionStatus: "waiting",
      connectionOtp: rawOtp,
      connectionOtpHash,
      connectionOtpExpiresAt: expiresAt,
      connectionOtpAttempts: 0,
      connectionOtpUsed: false,
      createdAt: now,
      updatedAt: now,
    };

    await setFirestoreDocServer("bookings", bookingId, bookingDoc, idToken);

    // 6. Save or update the Payment record in Firestore
    const paymentId = incomingPaymentId || `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const paymentDoc = {
      id: paymentId,
      bookingId,
      orderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      customerId: targetUserId,
      customerName: draft.customerName || "Valued Member",
      customerEmail: draft.customerEmail || "",
      providerId,
      providerName: draft.providerName || "Companion",
      serviceId,
      serviceName: draft.serviceName || "Companion Service",
      amount: Number(draft.amount) || 0,
      currency: "INR",
      paymentStatus: "paid",
      paymentMethod: "razorpay",
      mode: process.env.PAYMENT_MODE || "test",
      cityId: draft.cityId || "kanpur",
      cityName: draft.cityName || "Kanpur",
      localityId: draft.localityId || "panki",
      localityName: draft.localityName || "Panki",
      date: draft.date || new Date().toLocaleDateString(),
      time: draft.time || "06:00 PM",
      duration: draft.duration || "2 Hours",
      paidAt: now,
      updatedAt: now,
    };

    try {
      await setFirestoreDocServer("payments", paymentId, paymentDoc, idToken);
    } catch (e) {
      console.warn("Could not save payments record:", e);
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId,
        paymentId,
        connectionOtp: rawOtp,
        providerPhone,
        message: "Payment successfully verified and booking confirmed.",
      },
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VERIFICATION_ERROR",
          message: error?.message || "Internal server error during verification.",
        },
      },
      { status: 500 }
    );
  }
}

