export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { setFirestoreDocServer, getFirestoreDocServer } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    // 1. Must use raw text body for HMAC SHA-256 signature verification
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing x-razorpay-signature header." },
        { status: 400 }
      );
    }

    // 2. Cryptographic signature check
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("Razorpay Webhook: Invalid signature received.");
      return NextResponse.json(
        { success: false, error: "Invalid cryptographic signature." },
        { status: 400 }
      );
    }

    // 3. Parse validated JSON payload
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    console.log(`Razorpay Webhook event received: ${event}`, {
      paymentId: paymentEntity?.id,
      orderId: paymentEntity?.order_id || orderEntity?.id,
    });

    const orderId = paymentEntity?.order_id || orderEntity?.id;
    const paymentId = paymentEntity?.id;

    if (orderId) {
      const now = new Date().toISOString();

      if (event === "payment.captured" || event === "order.paid") {
        // Attempt to find and update payment record
        try {
          const updateData: Record<string, any> = {
            paymentStatus: "paid",
            razorpayPaymentId: paymentId || "",
            updatedAt: now,
          };
          if (paymentEntity?.method) {
            updateData.paymentMethodDetail = paymentEntity.method;
          }
          await setFirestoreDocServer("payments", `order_${orderId}`, updateData);
        } catch (e) {
          console.warn("Webhook: Could not update payment status:", e);
        }
      } else if (event === "payment.failed") {
        try {
          await setFirestoreDocServer("payments", `order_${orderId}`, {
            paymentStatus: "failed",
            failureReason: paymentEntity?.error_description || "Payment failed",
            updatedAt: now,
          });
        } catch (e) {
          console.warn("Webhook: Could not update failed payment:", e);
        }
      }
    }

    return NextResponse.json({ success: true, received: true, event });
  } catch (error: any) {
    console.error("Error processing Razorpay webhook:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Webhook handling error." },
      { status: 500 }
    );
  }
}

