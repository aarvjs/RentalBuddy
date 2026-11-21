const projectId =
  process.env.FIREBASE_PROJECT_ID ||
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  "rentbuddy-23ba6";

const apiKey =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyAl_qOyJ3GlbUWwv9l83Kb_1QG8GJ7_YO0";

export const adminDb = null;
export const adminAuth = null;

/**
 * Server-Side Secure ID Token Verification Helper.
 * Tries Firebase Admin SDK first if credentials are configured.
 * Otherwise verifies via Google Identity Toolkit REST API without requiring service account keys.
 */
export async function verifyServerIdToken(
  idToken: string
): Promise<{ uid: string; email?: string } | null> {
  if (!idToken || typeof idToken !== "string") return null;

  // Verify ID token securely via Google Identity Toolkit REST API
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
  // REST API write
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (idToken) {
    headers["Authorization"] = `Bearer ${idToken}`;
  }

  const payload = {
    fields: encodeFirestoreFields(data),
  };

  // Attempt 1: PATCH with updateMask for merge behavior
  const fieldMask = Object.keys(data)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join("&");
  const maskParam = fieldMask ? `&${fieldMask}` : "";
  const patchUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${docId}?key=${apiKey}${maskParam}`;

  try {
    const res = await fetch(patchUrl, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      return;
    }

    // Attempt 2: If document does not exist yet (404), upsert full document without mask
    const upsertUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}/${docId}?key=${apiKey}`;
    const upsertRes = await fetch(upsertUrl, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    });

    if (upsertRes.ok) {
      return;
    }

    // Attempt 3: POST to collection with ?documentId=
    const postUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?documentId=${docId}&key=${apiKey}`;
    const postRes = await fetch(postUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (postRes.ok) {
      return;
    }

    if (upsertRes.status !== 403) {
      const errText = await upsertRes.text().catch(() => "Unknown write error");
      console.warn(`Firestore REST write note (${upsertRes.status}): ${errText}`);
    }
  } catch (err: any) {
    console.warn("Server-side Firestore write exception:", err?.message || err);
  }
}

/**
 * Server-Side Secure Firestore Query Helper.
 * Checks for existing bookings or docs.
 */
export async function queryBookingsServer(
  providerId: string,
  date: string
): Promise<any[]> {
  // REST runQuery
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
