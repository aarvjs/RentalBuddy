import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayClientInstance: Razorpay | null = null;

/**
 * Returns a singleton Razorpay client instance configured with environment credentials.
 */
export function getRazorpayClient(): Razorpay {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay API credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are not configured."
    );
  }

  if (!razorpayClientInstance) {
    razorpayClientInstance = new Razorpay({
      key_id,
      key_secret,
    });
  }

  return razorpayClientInstance;
}

/**
 * Verifies Razorpay checkout payment signature using HMAC SHA-256.
 * (order_id + "|" + payment_id) hashed with RAZORPAY_KEY_SECRET
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret || !orderId || !paymentId || !signature) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(signature, "utf-8")
    );
  } catch (err) {
    console.error("Error verifying Razorpay signature:", err);
    return false;
  }
}

/**
 * Verifies Razorpay Webhook signature using HMAC SHA-256.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  webhookSecret?: string
): boolean {
  const secret = webhookSecret || process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature || !rawBody) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf-8"),
      Buffer.from(signature, "utf-8")
    );
  } catch (err) {
    console.error("Error verifying Webhook signature:", err);
    return false;
  }
}

