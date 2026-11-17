export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";
import {
  setFirestoreDocServer,
  getFirestoreDocServer,
  verifyServerIdToken,
} from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    // 1. Authenticate user if Bearer token is provided
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
      userId,
      customerName = "Valued Member",
      customerEmail = "",
      serviceId,
      serviceName = "Companion Service",
      providerId,
      providerName = "Companion",
      date,
      time,
      duration = "2 Hours",
      amount,
      hourlyRate,
      stateId = "up",
      stateName = "Uttar Pradesh",
      cityId = "kanpur",
      cityName = "Kanpur",
      localityId = "panki",
      localityName = "Panki",
    } = body;

    const targetUserId = verifiedUid || userId;
    if (!targetUserId || !serviceId || !providerId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_PARAMETERS",
            message: "Missing required booking and customer credentials.",
          },
        },
        { status: 400 }
      );
    }

    // 2. Validate / calculate price server-side
    const durationHours = parseInt(duration) || 1;
    let rate = Number(hourlyRate);

    // If rate not provided or suspicious, fetch from providerServices or service
    if (!rate || rate <= 0) {
      try {
        const psDoc = await getFirestoreDocServer(
          "providerServices",
          `${providerId}_${serviceId}`,
          idToken
        );
        if (psDoc && psDoc.hourlyRate) {
          rate = Number(psDoc.hourlyRate);
        } else {
          const sDoc = await getFirestoreDocServer("services", serviceId, idToken);
          rate = Number(sDoc?.price || sDoc?.basePrice || 2000);
        }
      } catch (err) {
        console.warn("Could not fetch server-side hourly rate, using fallback:", err);
        rate = Number(amount) ? Number(amount) / durationHours : 2000;
      }
    }

    const calculatedTotal = Math.max(1, Math.round(rate * durationHours));
    const amountInPaise = Math.round(calculatedTotal * 100);

    // 3. Create Razorpay Order
    const razorpay = getRazorpayClient();
    const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      notes: {
        userId: targetUserId,
        customerName: customerName.substring(0, 40),
        serviceId: serviceId.substring(0, 40),
        providerId: providerId.substring(0, 40),
        duration: `${durationHours} Hours`,
        mode: process.env.PAYMENT_MODE || "test",
      },
    });

    // 4. Save pre-authorization payment record in Firestore
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const paymentRecord = {
      id: paymentId,
      orderId: razorpayOrder.id,
      receiptId,
      customerId: targetUserId,
      customerName,
      customerEmail,
      providerId,
      providerName,
      serviceId,
      serviceName,
      amount: calculatedTotal,
      currency: "INR",
      paymentStatus: "pending",
      paymentMethod: "razorpay",
      mode: process.env.PAYMENT_MODE || "test",
      date,
      time,
      duration: `${durationHours} Hour${durationHours > 1 ? "s" : ""}`,
      stateId,
      stateName,
      cityId,
      cityName,
      localityId,
      localityName,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setFirestoreDocServer("payments", paymentId, paymentRecord, idToken);
    } catch (dbErr) {
      console.warn("Failed to write initial pending payment doc:", dbErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        paymentId,
        amount: calculatedTotal,
        amountInPaise,
        currency: "INR",
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "ORDER_CREATION_FAILED",
          message: error?.message || "Failed to initiate payment gateway order.",
        },
      },
      { status: 500 }
    );
  }
}

