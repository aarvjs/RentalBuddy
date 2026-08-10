import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminUserListItem } from "@/types/admin";

export async function getAllUsers(): Promise<AdminUserListItem[]> {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    const list: AdminUserListItem[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ uid: docSnap.id, ...docSnap.data() } as AdminUserListItem);
    });
    return list;
  } catch (error) {
    console.warn("Could not fetch users list:", error);
    return [];
  }
}

export async function getUserDetails(uid: string): Promise<AdminUserListItem | null> {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() } as AdminUserListItem;
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
