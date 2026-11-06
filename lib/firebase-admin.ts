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

function parsePrivateKey(key?: string): string | undefined {
  if (!key) return undefined;
  let cleaned = key.trim();
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.replace(/\\n/g, "\n");
}

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

let adminApp: any = null;
let adminDbInstance: any = null;
let adminAuthInstance: any = null;

const hasServiceAccount = Boolean(clientEmail && privateKey);

if (hasServiceAccount) {
  try {
    const existingApps = getApps();
    const foundApp = existingApps.find((app) => app.name === "rentbuddyAdminApp");

    if (foundApp) {
      adminApp = foundApp;
    } else {
      adminApp = initializeApp(
        {
          credential: cert({
            projectId,
            clientEmail: clientEmail!,
            privateKey: privateKey!,
          }),
        },
        "rentbuddyAdminApp"
      );
    }

    adminDbInstance = getFirestore(adminApp);
    adminAuthInstance = getAuth(adminApp);
  } catch (e: any) {
    console.warn("Firebase Admin SDK initialization notice:", e?.message || e);
  }
}

export const adminDb = adminDbInstance;
export const adminAuth = adminAuthInstance;

/**
 * Server-Side Secure ID Token Verification Helper.
 * Tries Firebase Admin SDK first if credentials are configured.
 * Otherwise verifies via Google Identity Toolkit REST API without requiring service account keys.
 */
export async function verifyServerIdToken(
  idToken: string
): Promise<{ uid: string; email?: string } | null> {
  if (!idToken || typeof idToken !== "string") return null;

  if (adminAuthInstance) {
    try {
      const decoded = await adminAuthInstance.verifyIdToken(idToken);
      return { uid: decoded.uid, email: decoded.email };
    } catch (err: any) {
      console.warn("Admin SDK verifyIdToken notice:", err?.code || err?.message);
    }
  }

  // Fallback: Verify ID token securely via Google Identity Toolkit REST API
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      const user = data.users?.[0];
      if (user?.localId) {
        return { uid: user.localId, email: user.email };
      }
    }
  } catch (err: any) {
    console.warn("Identity Toolkit token lookup notice:", err?.message);
  }

  return null;
}

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
  const patchUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${docId}?key=${apiKey}${maskParam}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (idToken) {
    headers["Authorization"] = `Bearer ${idToken}`;
  }

  const payload = {
    fields: encodeFirestoreFields(data),
  };

  const res = await fetch(patchUrl, {
    method: "PATCH",
    headers,
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    return;
  }

  // If PATCH failed (e.g., document doesn't exist yet), attempt POST with ?documentId=
  const postUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?documentId=${docId}&key=${apiKey}`;
  const postRes = await fetch(postUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (postRes.ok) {
    return;
  }

  const errText = await res.text();
  throw new Error(`Firestore REST write error (${res.status}): ${errText}`);
}

/**
 * Server-Side Secure Firestore Query Helper.
 * Checks for existing bookings or docs.
 */
export async function queryBookingsServer(
  providerId: string,
  date: string
): Promise<any[]> {
  if (hasServiceAccount && adminDb) {
    try {
      const snap = await adminDb
        .collection("bookings")
        .where("providerId", "==", providerId)
        .where("date", "==", date)
        .get();
      const list: any[] = [];
      snap.forEach((d: any) => list.push({ id: d.id, ...d.data() }));
      return list;
    } catch (e: any) {
      console.warn("adminDb queryBookingsServer error:", e?.message);
    }
  }

  // REST runQuery fallback
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`;
    const queryPayload = {
      structuredQuery: {
        from: [{ collectionId: "bookings" }],
        where: {
          compositeFilter: {
            op: "AND",
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: "providerId" },
                  op: "EQUAL",
                  value: { stringValue: providerId },
                },
              },
              {
                fieldFilter: {
                  field: { fieldPath: "date" },
                  op: "EQUAL",
                  value: { stringValue: date },
                },
              },
            ],
          },
        },
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(queryPayload),
    });

    if (res.ok) {
      const results = await res.json();
      const list: any[] = [];
      if (Array.isArray(results)) {
        for (const item of results) {
          if (item.document) {
            const data = decodeFirestoreDoc(item.document);
            if (data) {
              list.push({ id: item.document.name?.split("/").pop(), ...data });
            }
          }
        }
      }
      return list;
    }
  } catch (err: any) {
    console.warn("queryBookingsServer REST error:", err?.message);
  }

  return [];
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

  const res = await fetch(url, {
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
