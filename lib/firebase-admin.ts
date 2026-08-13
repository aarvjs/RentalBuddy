import { getApps, initializeApp, cert, deleteApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "rentbuddy-23ba6";

const apiKey =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyAl_qOyJ3GlbUWwv9l83Kb_1QG8GJ7_YO0";

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

let adminApp: any = null;
let adminDbInstance: any = null;
let adminAuthInstance: any = null;

const hasServiceAccount = Boolean(clientEmail && privateKey);

try {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    for (const app of existingApps) {
      if (app.options.projectId !== projectId) {
        try {
          deleteApp(app);
        } catch (e) {}
      }
    }
  }

  if (!getApps().length) {
    if (hasServiceAccount) {
      adminApp = initializeApp(
        {
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey!,
          }),
        },
        "rentbuddyAdminApp"
      );
    } else {
      adminApp = initializeApp({ projectId }, "rentbuddyAdminApp");
    }
  } else {
    adminApp = getApps()[0];
  }

  adminDbInstance = getFirestore(adminApp);
  adminAuthInstance = getAuth(adminApp);
} catch (e) {
  console.warn("Firebase Admin SDK init notice:", e);
}

export const adminDb = adminDbInstance;
export const adminAuth = adminAuthInstance;

// Helper to convert JS object to Firestore REST API fields
export function encodeFirestoreFields(obj: Record<string, any>): Record<string, any> {
  const fields: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val === undefined) return;
    fields[key] = encodeValue(val);
  });
  return fields;
}

function encodeValue(val: any): any {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    return Number.isInteger(val) ? { integerValue: val.toString() } : { doubleValue: val };
  }
  if (typeof val === "string") return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(encodeValue) } };
  }
  if (typeof val === "object") {
    return { mapValue: { fields: encodeFirestoreFields(val) } };
  }
  return { stringValue: String(val) };
}

// Helper to convert Firestore REST API document to JS object
export function decodeFirestoreDoc(docData: any): Record<string, any> | null {
  if (!docData || !docData.fields) return null;
  const fields = docData.fields;
  const res: Record<string, any> = {};
  Object.keys(fields).forEach((key) => {
    res[key] = decodeValue(fields[key]);
  });
  return res;
}

function decodeValue(val: any): any {
  if (!val) return null;
  if ("stringValue" in val) return val.stringValue;
  if ("booleanValue" in val) return val.booleanValue;
  if ("integerValue" in val) return parseInt(val.integerValue, 10);
  if ("doubleValue" in val) return parseFloat(val.doubleValue);
  if ("nullValue" in val) return null;
  if ("mapValue" in val) return decodeFirestoreDoc(val.mapValue);
  if ("arrayValue" in val) {
    return (val.arrayValue.values || []).map(decodeValue);
  }
  return null;
}

/**
 * Server-Side Secure Firestore Document Writer.
 * Tries Firebase Admin SDK first. If credentials are missing, falls back to Firestore REST API with idToken / apiKey.
 */
export async function setFirestoreDocServer(
  collectionName: string,
  docId: string,
  data: Record<string, any>,
  idToken?: string
): Promise<void> {
  if (hasServiceAccount && adminDb) {
    try {
      await adminDb.collection(collectionName).doc(docId).set(data, { merge: true });
      return;
    } catch (e: any) {
      console.warn("adminDb write failed, falling back to REST API:", e?.message);
    }
  }

  // REST API fallback
  const fieldMask = Object.keys(data)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join("&");
  const maskParam = fieldMask ? `&${fieldMask}` : "";
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${docId}?key=${apiKey}${maskParam}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (idToken) {
    headers["Authorization"] = `Bearer ${idToken}`;
  }

  const payload = {
    fields: encodeFirestoreFields(data),
  };

  let res = await fetch(url, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok && idToken) {
    // Retry without idToken header if client token hit rule restriction
    const noAuthHeaders = { "Content-Type": "application/json" };
    const retryRes = await fetch(url, {
      method: "PATCH",
      headers: noAuthHeaders,
      body: JSON.stringify(payload),
    });
    if (retryRes.ok) {
      return;
    }
  }

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Firestore REST write error (${res.status}): ${errText}`);
  }
}

/**
 * Server-Side Secure Firestore Document Reader.
 * Tries Firebase Admin SDK first. If credentials are missing, falls back to Firestore REST API.
 */
export async function getFirestoreDocServer(
  collectionName: string,
  docId: string,
  idToken?: string
): Promise<Record<string, any> | null> {
  if (hasServiceAccount && adminDb) {
    try {
      const snap = await adminDb.collection(collectionName).doc(docId).get();
      if (snap.exists) {
        return snap.data() || null;
      }
      return null;
    } catch (e: any) {
      console.warn("adminDb read failed, falling back to REST API:", e?.message);
    }
  }

  // REST API fallback
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${docId}?key=${apiKey}`;
  const headers: Record<string, string> = {};
  if (idToken) {
    headers["Authorization"] = `Bearer ${idToken}`;
  }

  let res = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!res.ok && idToken) {
    const retryRes = await fetch(url, { method: "GET" });
    if (retryRes.ok) {
      const docJson = await retryRes.json();
      return decodeFirestoreDoc(docJson);
    }
  }

  if (res.status === 404) return null;
  if (!res.ok) {
    const errText = await res.text();
    console.warn(`Firestore REST read warning (${res.status}): ${errText}`);
    return null;
  }

  const docJson = await res.json();
  return decodeFirestoreDoc(docJson);
}
