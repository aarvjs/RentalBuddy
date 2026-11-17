import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { storage, db, auth } from "@/lib/firebase";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Please select a JPG, PNG, or WEBP image file.",
    };
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image size exceeds 5 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB). Please select a smaller image.`,
    };
  }
  return { valid: true };
}

/**
 * Client-side image compression using canvas for large photos
 */
export async function compressImage(file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.85): Promise<Blob> {
  if (typeof window === "undefined") return file;
  if (file.size < 800 * 1024) return file; // Skip compression for images under 800KB

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              resolve(blob || file);
            },
            "image/webp",
            quality
          );
        } else {
          resolve(file);
        }
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

/**
 * Upload Avatar Photo
 */
export async function uploadAvatarMedia(
  uid: string,
  file: File,
  isProviderAccount = false
): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.valid) throw new Error(validation.error);

  const compressedBlob = await compressImage(file, 800, 800, 0.9);
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storageRef = ref(storage, `profile-media/${uid}/avatar/${Date.now()}_${cleanName}`);

  await uploadBytes(storageRef, compressedBlob, {
    contentType: file.type || "image/jpeg",
  });
  const downloadURL = await getDownloadURL(storageRef);

  // Sync to users/{uid}
  try {
    await updateDoc(doc(db, "users", uid), {
      photoURL: downloadURL,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    // If doc doesn't exist, create it with setDoc merge
    await setDoc(doc(db, "users", uid), { photoURL: downloadURL, updatedAt: new Date().toISOString() }, { merge: true });
  }

  // If provider or both, sync to providers/{uid}
  if (isProviderAccount) {
    try {
      await updateDoc(doc(db, "providers", uid), {
        photoURL: downloadURL,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      await setDoc(doc(db, "providers", uid), { photoURL: downloadURL, updatedAt: new Date().toISOString() }, { merge: true });
    }
  }

  // Update Firebase Auth display
  if (auth.currentUser && auth.currentUser.uid === uid) {
    try {
      await updateProfile(auth.currentUser, { photoURL: downloadURL });
    } catch (e) {
      console.warn("Could not update auth photoURL:", e);
    }
  }

  return downloadURL;
}

/**
 * Upload Cover Photo
 */
export async function uploadCoverMedia(
  uid: string,
  file: File,
  isProviderAccount = false
): Promise<string> {
  const validation = validateImageFile(file);
  if (!validation.valid) throw new Error(validation.error);

  const compressedBlob = await compressImage(file, 1920, 1080, 0.88);
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storageRef = ref(storage, `profile-media/${uid}/cover/${Date.now()}_${cleanName}`);

  await uploadBytes(storageRef, compressedBlob, {
    contentType: file.type || "image/jpeg",
  });
  const downloadURL = await getDownloadURL(storageRef);

  // Sync to users/{uid}
  try {
    await updateDoc(doc(db, "users", uid), {
      coverPhotoURL: downloadURL,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    await setDoc(doc(db, "users", uid), { coverPhotoURL: downloadURL, updatedAt: new Date().toISOString() }, { merge: true });
  }

  // If provider, sync to providers/{uid}
  if (isProviderAccount) {
    try {
      await updateDoc(doc(db, "providers", uid), {
        coverPhotoURL: downloadURL,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      await setDoc(doc(db, "providers", uid), { coverPhotoURL: downloadURL, updatedAt: new Date().toISOString() }, { merge: true });
    }
  }

  return downloadURL;
}

/**
 * Remove Cover Photo
 */
export async function removeCoverMedia(uid: string, isProviderAccount = false): Promise<void> {
  try {
    await updateDoc(doc(db, "users", uid), {
      coverPhotoURL: "",
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // ignore
  }

  if (isProviderAccount) {
    try {
      await updateDoc(doc(db, "providers", uid), {
        coverPhotoURL: "",
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // ignore
    }
  }
}

/**
 * Upload Gallery Photo
 */
export async function uploadGalleryMedia(
  uid: string,
  file: File,
  currentGallery: string[] = [],
  isProviderAccount = false
): Promise<string[]> {
  if (currentGallery.length >= 8) {
    throw new Error("Maximum 8 profile gallery images allowed. Please remove an existing image first.");
  }

  const validation = validateImageFile(file);
  if (!validation.valid) throw new Error(validation.error);

  const compressedBlob = await compressImage(file, 1600, 1200, 0.85);
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storageRef = ref(storage, `profile-media/${uid}/gallery/${Date.now()}_${cleanName}`);

  await uploadBytes(storageRef, compressedBlob, {
    contentType: file.type || "image/jpeg",
  });
  const downloadURL = await getDownloadURL(storageRef);

  const updatedGallery = [...currentGallery, downloadURL];

  // Update Firestore
  try {
    await updateDoc(doc(db, "users", uid), {
      galleryPhotos: updatedGallery,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    await setDoc(doc(db, "users", uid), { galleryPhotos: updatedGallery }, { merge: true });
  }

  if (isProviderAccount) {
    try {
      await updateDoc(doc(db, "providers", uid), {
        portfolioImages: updatedGallery,
        galleryPhotos: updatedGallery,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      await setDoc(doc(db, "providers", uid), { portfolioImages: updatedGallery, galleryPhotos: updatedGallery }, { merge: true });
    }
  }

  return updatedGallery;
}

/**
 * Remove Gallery Photo
 */
export async function removeGalleryMedia(
  uid: string,
  urlToRemove: string,
  currentGallery: string[],
  isProviderAccount = false
): Promise<string[]> {
  const updatedGallery = currentGallery.filter((url) => url !== urlToRemove);

  try {
    await updateDoc(doc(db, "users", uid), {
      galleryPhotos: updatedGallery,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // ignore
  }

  if (isProviderAccount) {
    try {
      await updateDoc(doc(db, "providers", uid), {
        portfolioImages: updatedGallery,
        galleryPhotos: updatedGallery,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // ignore
    }
  }

  return updatedGallery;
}

/**
 * Reorder Gallery Photos
 */
export async function reorderGalleryMedia(
  uid: string,
  reorderedGallery: string[],
  isProviderAccount = false
): Promise<void> {
  try {
    await updateDoc(doc(db, "users", uid), {
      galleryPhotos: reorderedGallery,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    // ignore
  }

  if (isProviderAccount) {
    try {
      await updateDoc(doc(db, "providers", uid), {
        portfolioImages: reorderedGallery,
        galleryPhotos: reorderedGallery,
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // ignore
    }
  }
}

