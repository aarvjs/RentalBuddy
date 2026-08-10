import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { ProviderService, PriceType, ServiceStatus } from "@/types/service-provider";

export interface MasterServiceItem {
  id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  priceType: string;
  imageUrl?: string;
  status: ServiceStatus;
  createdAt?: string;
}

export const DEFAULT_MASTER_SERVICES: MasterServiceItem[] = [
  {
    id: "movie-partner",
    serviceName: "Movie Partner",
    category: "Cinema & Theater",
    description: "Enjoy premiere film screenings, theater shows, and film festivals with an engaging partner who loves cinema.",
    price: 49,
    priceType: "hourly",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800",
    status: "active",
  },
  {
    id: "shopping-buddy",
    serviceName: "Shopping Buddy",
    category: "Fashion & Style",
    description: "Explore high-end boutiques, personal styling salons, and shopping districts with an articulate fashion enthusiast.",
    price: 59,
    priceType: "hourly",
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
    status: "active",
  },
  {
    id: "hangingout",
    serviceName: "Hangingout",
    category: "Casual & Strolls",
    description: "Relax over artisan coffee, park walks, and casual conversations in a warm, judgment-free atmosphere.",
    price: 39,
    priceType: "hourly",
    imageUrl: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
    status: "active",
  },
  {
    id: "elder-care",
    serviceName: "Elder Care",
    category: "Care & Companionship",
    description: "Provide gentle, respectful companionship, active listening, board games, and walk support for cherished seniors.",
    price: 45,
    priceType: "hourly",
    imageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=800",
    status: "active",
  },
  {
    id: "medical-support",
    serviceName: "Medical Support",
    category: "Care & Support",
    description: "A comforting presence to accompany you to medical appointments, checkups, or recovery days with empathy.",
    price: 49,
    priceType: "hourly",
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
    status: "active",
  },
  {
    id: "travel-partner",
    serviceName: "Travel Partner",
    category: "Travel & Escape",
    description: "Turn solo trips into unforgettable getaways with a cultured travel companion for villa retreats and coastal tours.",
    price: 199,
    priceType: "daily",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800",
    status: "active",
  },
  {
    id: "clubbing",
    serviceName: "Clubbing",
    category: "Nightlife & VIP",
    description: "Experience high-energy nightlife, private lounges, and music events with a stylish companion keeping the vibe vibrant.",
    price: 89,
    priceType: "hourly",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800",
    status: "active",
  },
  {
    id: "domestic-help",
    serviceName: "Domestic Help",
    category: "Home & Host Assistant",
    description: "Assist in hosting dinner parties, greeting guests, organizing home events, and ensuring smooth social gatherings.",
    price: 49,
    priceType: "hourly",
    imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800",
    status: "active",
  },
];

/**
 * Fetch all master services from Firestore `services` collection.
 * If empty, seed default master services so Admin & Providers always see valid services.
 */
export async function getMasterServices(): Promise<MasterServiceItem[]> {
  try {
    const snapshot = await getDocs(collection(db, "services"));
    const services: MasterServiceItem[] = [];

    snapshot.forEach((docSnap) => {
      services.push({ id: docSnap.id, ...docSnap.data() } as MasterServiceItem);
    });

    if (services.length > 0) {
      return services;
    }

    // Seed default master services if Firestore collection is empty
    const seededServices: MasterServiceItem[] = [];
    for (const item of DEFAULT_MASTER_SERVICES) {
      const docRef = doc(db, "services", item.id);
      const serviceData = {
        ...item,
        createdAt: new Date().toISOString(),
      };
      await setDoc(docRef, serviceData);
      seededServices.push(serviceData);
    }
    return seededServices;
  } catch (error) {
    console.warn("Could not fetch master services from Firestore:", error);
    return DEFAULT_MASTER_SERVICES;
  }
}

/**
 * Fetch a Provider's service availability map from Firestore `providerServices`.
 * Returns a Record<serviceId, boolean>.
 */
export async function getProviderAvailabilityMap(
  providerId: string
): Promise<Record<string, boolean>> {
  try {
    const q = query(
      collection(db, "providerServices"),
      where("providerId", "==", providerId)
    );
    const snapshot = await getDocs(q);
    const resultMap: Record<string, boolean> = {};

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.serviceId) {
        resultMap[data.serviceId] = data.available === true;
      }
    });

    return resultMap;
  } catch (error) {
    console.warn("Could not fetch provider availability map:", error);
    return {};
  }
}

/**
 * Update availability for a specific service for a Provider in Firestore `providerServices`.
 * Document ID: providerId_serviceId
 */
export async function updateProviderAvailability(
  providerId: string,
  serviceId: string,
  available: boolean
): Promise<void> {
  const docId = `${providerId}_${serviceId}`;
  const docRef = doc(db, "providerServices", docId);

  await setDoc(
    docRef,
    {
      providerId,
      serviceId,
      available,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Check count of providers currently available for a given service.
 */
export async function getAvailableProviderCountForService(
  serviceId: string
): Promise<number> {
  try {
    const q = query(
      collection(db, "providerServices"),
      where("serviceId", "==", serviceId),
      where("available", "==", true)
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.warn(`Could not check provider availability count for service ${serviceId}:`, error);
    return 0;
  }
}

export interface CreateServiceInput {
  serviceName: string;
  category: string;
  description: string;
  price: number;
  priceType: PriceType;
  duration: string;
  availability: string;
  serviceArea: string;
  imageFiles: File[];
}

export async function createProviderService(
  providerId: string,
  input: CreateServiceInput
): Promise<ProviderService> {
  const serviceId = `srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const imageUrls: string[] = [];

  for (let i = 0; i < input.imageFiles.length; i++) {
    const file = input.imageFiles[i];
    const storageRef = ref(storage, `provider_services/${providerId}/${serviceId}_${i}_${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    imageUrls.push(url);
  }

  const newService: ProviderService = {
    id: serviceId,
    providerId,
    serviceName: input.serviceName.trim(),
    category: input.category.trim(),
    description: input.description.trim(),
    price: input.price,
    priceType: input.priceType,
    duration: input.duration.trim(),
    availability: input.availability.trim(),
    serviceArea: input.serviceArea.trim(),
    serviceImages: imageUrls,
    status: "active",
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "services", serviceId), newService);
  return newService;
}

export async function getProviderServices(providerId: string): Promise<ProviderService[]> {
  try {
    const q = query(collection(db, "services"), where("providerId", "==", providerId));
    const snapshot = await getDocs(q);
    const services: ProviderService[] = [];
    snapshot.forEach((docSnap) => {
      services.push({ id: docSnap.id, ...docSnap.data() } as ProviderService);
    });
    return services;
  } catch (error) {
    console.warn("Could not fetch provider services from Firestore:", error);
    return [];
  }
}

export async function updateServiceStatus(
  serviceId: string,
  status: ServiceStatus
): Promise<void> {
  const docRef = doc(db, "services", serviceId);
  await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
}
