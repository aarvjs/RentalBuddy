import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminUserListItem } from "@/types/admin";

export async function getAllUsers(): Promise<AdminUserListItem[]> {
  try {
    // 1. Fetch all admin UIDs to exclude admin accounts from customer/provider list
    const adminsSnapshot = await getDocs(collection(db, "admins"));
    const adminUids = new Set<string>();
    adminsSnapshot.forEach((docSnap) => {
      adminUids.add(docSnap.id);
    });

    // 2. Fetch all users from users collection
    const snapshot = await getDocs(collection(db, "users"));
    const list: AdminUserListItem[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const uid = docSnap.id;

      // Filter out Admin accounts safely without deleting legacy data
      if (
        adminUids.has(uid) ||
        data?.role === "admin" ||
        data?.userType === "admin"
      ) {
        return;
      }

      list.push({ uid, ...data } as AdminUserListItem);
    });
    return list;
  } catch (error) {
    console.warn("Could not fetch users list:", error);
    return [];
  }
}

export async function getUserDetails(uid: string): Promise<AdminUserListItem | null> {
  try {
    // Verify UID is not an admin in admins collection
    const adminSnap = await getDoc(doc(db, "admins", uid));
    if (adminSnap.exists() && adminSnap.data()?.role === "admin") {
      return null;
    }

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data?.role === "admin" || data?.userType === "admin") {
        return null;
      }
      return { uid: docSnap.id, ...data } as AdminUserListItem;
    }
    return null;
  } catch (error) {
    console.warn("Could not fetch user details:", error);
    return null;
  }
}

export async function updateUserAccountStatus(uid: string, status: "active" | "suspended"): Promise<void> {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
}
