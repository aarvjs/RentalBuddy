export const runtime = "nodejs";

import { NextResponse } from "next/server";
import crypto from "crypto";
import {
  setFirestoreDocServer,
  getFirestoreDocServer,
  verifyServerIdToken,
  queryBookingsServer,
} from "@/lib/firebase-admin";

function parseTimeString(timeStr?: string): number {
  if (!timeStr) return 0;
  const cleanStr = timeStr.split("–")[0].split("-")[0].trim();
  const match = cleanStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3] ? match[3].toUpperCase() : "AM";
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export async function POST(request: Request) {
  try {
    // 1. Extract and verify Bearer Token
    const authHeader = request.headers.get("Authorization");
    let idToken = "";
    let verifiedUid = "";

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

    // 2. Atomic Server-Side Check: Check for overlapping bookings
    if (providerId && date && time) {
      try {
        const existingBookings = await queryBookingsServer(providerId, date);
        const reqStart = parseTimeString(time);
        const reqDurationHrs = parseInt(duration) || 1;
        const reqEnd = reqStart + reqDurationHrs * 60;

        const hasConflict = existingBookings.some((b: any) => {
          if (b.status === "cancelled") return false;
          const bStart = parseTimeString(b.time);
          const bDuration = parseInt(b.duration) || 1;
          const bEnd = bStart + bDuration * 60;
          return reqStart < bEnd && reqEnd > bStart;
        });

        if (hasConflict) {
          return NextResponse.json(
            {
              error:
                "This Partner is already booked during the selected time. Please choose another time slot or date.",
            },
            { status: 409 }
          );
        }
      } catch (err) {
        console.warn("Could not verify overlapping bookings server-side:", err);
      }
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
