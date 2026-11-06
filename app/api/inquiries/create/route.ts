export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { setFirestoreDocServer } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, occasion, destination, notes } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and Email are required fields." },
        { status: 400 }
      );
    }

    const inquiryId = `inq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const createdAt = new Date().toISOString();

    const inquiryDoc = {
      id: inquiryId,
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : "",
      occasion: occasion ? String(occasion) : "General Inquiry",
      destination: destination ? String(destination) : "",
      notes: notes ? String(notes).trim() : "",
      status: "new",
      createdAt,
    };

    await setFirestoreDocServer("inquiries", inquiryId, inquiryDoc);

    return NextResponse.json({
      success: true,
      inquiryId,
      message: "Inquiry saved successfully to Firestore.",
    });
  } catch (error: any) {
    console.error("Error saving inquiry via API route:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error saving inquiry." },
      { status: 500 }
    );
  }
}
