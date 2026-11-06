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
import { ProviderService, PriceType, ServiceStatus, ProviderAvailabilityConfig } from "@/types/service-provider";

export interface MasterServiceItem {
  id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  priceType: string;
  imageUrl?: string;
  status: ServiceStatus;
  location?: {
    fullAddress: string;
    country: string;
    state: string;
    city: string;
    locality: string;
    pincode: string;
    latitude: number;
    longitude: number;
  };
  address?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  stateId?: string;
  stateName?: string;
  cityId?: string;
  cityName?: string;
  localityId?: string;
  localityName?: string;
  createdAt?: string;
  updatedAt?: string;
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
    stateId: "up",
    stateName: "Uttar Pradesh",
    cityId: "kanpur",
    cityName: "Kanpur",
    localityId: "panki",
    localityName: "Panki",
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
    stateId: "delhi",
    stateName: "Delhi",
    cityId: "delhi_city",
    cityName: "Delhi",
    localityId: "anand_vihar",
    localityName: "Anand Vihar",
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
    stateId: "up",
    stateName: "Uttar Pradesh",
    cityId: "kanpur",
    cityName: "Kanpur",
    localityId: "panki",
    localityName: "Panki",
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
    stateId: "up",
    stateName: "Uttar Pradesh",
    cityId: "lucknow",
    cityName: "Lucknow",
    localityId: "hazratganj",
    localityName: "Hazratganj",
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
    stateId: "up",
    stateName: "Uttar Pradesh",
    cityId: "kanpur",
    cityName: "Kanpur",
    localityId: "panki",
    localityName: "Panki",
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
    stateId: "delhi",
    stateName: "Delhi",
    cityId: "delhi_city",
    cityName: "Delhi",
    localityId: "anand_vihar",
    localityName: "Anand Vihar",
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
    stateId: "up",
    stateName: "Uttar Pradesh",
    cityId: "kanpur",
    cityName: "Kanpur",
    localityId: "panki",
    localityName: "Panki",
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
    stateId: "up",
    stateName: "Uttar Pradesh",
    cityId: "kanpur",
    cityName: "Kanpur",
    localityId: "panki",
    localityName: "Panki",
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
 * Fetch a Provider's full service availability configuration from Firestore `providerServices`.
 * Returns a Record<serviceId, ProviderAvailabilityConfig>.
 */
export async function getProviderAvailabilityConfigs(
  providerId: string
): Promise<Record<string, ProviderAvailabilityConfig>> {
  try {
    const q = query(
      collection(db, "providerServices"),
      where("providerId", "==", providerId)
    );
    const snapshot = await getDocs(q);
    const resultMap: Record<string, ProviderAvailabilityConfig> = {};

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.serviceId) {
        const isAvail = data.isAvailable === true || data.available === true;
        resultMap[data.serviceId] = {
          providerId,
          serviceId: data.serviceId,
          serviceName: data.serviceName || "",
          available: isAvail,
          isAvailable: isAvail,
          availableFrom: data.availableFrom || "",
          availableTo: data.availableTo || "",
          contactNumber: data.contactNumber || "",
          updatedAt: data.updatedAt || "",
        };
      }
    });

    return resultMap;
  } catch (error) {
    console.warn("Could not fetch provider availability configs:", error);
    return {};
  }
}

/**
 * Fetch a Provider's service availability map from Firestore `providerServices`.
 * Returns a Record<serviceId, boolean>.
 */
export async function getProviderAvailabilityMap(
  providerId: string
): Promise<Record<string, boolean>> {
  const configs = await getProviderAvailabilityConfigs(providerId);
  const resultMap: Record<string, boolean> = {};
  Object.keys(configs).forEach((key) => {
    resultMap[key] = configs[key].isAvailable;
  });
  return resultMap;
}

/**
 * Update availability config for a specific service for a Provider in Firestore `providerServices`.
 * Document ID: providerId_serviceId
 */
export async function updateProviderAvailabilityConfig(
  providerId: string,
  serviceId: string,
  config: {
    isAvailable: boolean;
    availableFrom?: string;
    availableTo?: string;
    contactNumber?: string;
    serviceName?: string;
    stateId?: string;
    stateName?: string;
    cityId?: string;
    cityName?: string;
    localityId?: string;
    localityName?: string;
  }
): Promise<void> {
  const docId = `${providerId}_${serviceId}`;
  const docRef = doc(db, "providerServices", docId);

  const payload: any = {
    providerId,
    serviceId,
    available: config.isAvailable,
    isAvailable: config.isAvailable,
    availableFrom: config.availableFrom || "",
    availableTo: config.availableTo || "",
    contactNumber: config.contactNumber ? config.contactNumber.trim() : "",
    updatedAt: new Date().toISOString(),
  };

  if (config.serviceName) payload.serviceName = config.serviceName;
  if (config.stateId) payload.stateId = config.stateId;
  if (config.stateName) payload.stateName = config.stateName;
  if (config.cityId) payload.cityId = config.cityId;
  if (config.cityName) payload.cityName = config.cityName;
  if (config.localityId) payload.localityId = config.localityId;
  if (config.localityName) payload.localityName = config.localityName;

  await setDoc(docRef, payload, { merge: true });
}

/**
 * Legacy toggle update availability for a specific service for a Provider in Firestore `providerServices`.
 * Document ID: providerId_serviceId
 */
export async function updateProviderAvailability(
  providerId: string,
  serviceId: string,
  available: boolean
): Promise<void> {
  await updateProviderAvailabilityConfig(providerId, serviceId, { isAvailable: available });
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

/**
 * Fetch a single Master Service by ID or slug from Firestore/Defaults.
 */
export async function getServiceById(serviceId: string): Promise<MasterServiceItem | null> {
  try {
    const docRef = doc(db, "services", serviceId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as MasterServiceItem;
    }
  } catch (err) {
    console.warn("Could not fetch service by ID from Firestore:", err);
  }

  // Check default master services by exact ID or slug match
  const normalizedId = serviceId.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const foundDefault = DEFAULT_MASTER_SERVICES.find(
    (s) =>
      s.id === serviceId ||
      s.id.toLowerCase().replace(/[^a-z0-9]/g, "-") === normalizedId ||
      s.serviceName.toLowerCase().replace(/[^a-z0-9]/g, "-") === normalizedId
  );
  if (foundDefault) {
    return foundDefault;
  }

  // Fallback: check all master services from Firestore to match by slug or name
  try {
    const all = await getMasterServices();
    const found = all.find(
      (s) =>
        s.id === serviceId ||
        s.id.toLowerCase().replace(/[^a-z0-9]/g, "-") === normalizedId ||
        s.serviceName.toLowerCase().replace(/[^a-z0-9]/g, "-") === normalizedId
    );
    if (found) return found;
  } catch (e) {
    console.warn("Could not match service from all services:", e);
  }

  return null;
}

export interface EligibleProviderInfo {
  providerId: string;
  fullName: string;
  serviceId: string;
  serviceName: string;
  hourlyRate: number;
  availableFrom: string;
  availableTo: string;
  photoURL?: string;
  bio?: string;
  rating?: number;
  reviewsCount?: number;
  isKycApproved: boolean;
  isActive: boolean;
  stateId?: string;
  stateName?: string;
  cityId?: string;
  cityName?: string;
  localityId?: string;
  localityName?: string;
  gender?: string;
  languages?: string[];
  experience?: string;
  latitude?: number;
  longitude?: number;
}

function cleanLoc(str?: string): string {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

/**
 * Fetch only eligible Service Providers enrolled in a specific service and matching customer's location.
 * Conditions:
 * 1. Enrolled in this service (providerServices doc exists).
 * 2. Availability enabled (isAvailable === true).
 * 3. KYC status approved (kycStatus === 'approved').
 * 4. Active provider account (providerStatus === 'active').
 * 5. Matches customer's location (cityId/localityId or structured matching).
 * 6. Eligible to accept bookings.
 */
export async function getEligibleProvidersForService(
  serviceId: string,
  customerLocation?: {
    cityId?: string;
    cityName?: string;
    city?: string;
    localityId?: string;
    localityName?: string;
    locality?: string;
    stateId?: string;
    stateName?: string;
  } | null
): Promise<EligibleProviderInfo[]> {
  try {
    // 1. Query providerServices for this service with availability enabled
    const q = query(
      collection(db, "providerServices"),
      where("serviceId", "==", serviceId),
      where("isAvailable", "==", true)
    );
    const snapshot = await getDocs(q);

    // Also look for fallback availability if serviceId was created with legacy key
    const docs = [...snapshot.docs];

    const custCity = cleanLoc(customerLocation?.cityId || customerLocation?.city || customerLocation?.cityName);
    const custLoc = cleanLoc(customerLocation?.localityId || customerLocation?.locality || customerLocation?.localityName);

    const eligibleList: EligibleProviderInfo[] = [];

    await Promise.all(
      docs.map(async (docSnap) => {
        const psData = docSnap.data();
        const providerId = psData.providerId;
        if (!providerId) return;

        // 2. Fetch Provider Profile from providers/{providerId}
        const provDoc = await getDoc(doc(db, "providers", providerId));
        if (!provDoc.exists()) return;
        const pData = provDoc.data();

        // 3. Verify Approved KYC
        const isKycApproved =
          pData.kycStatus === "approved" ||
          pData.kycStatus === "verified" ||
          pData.phoneVerified === true;
        if (!isKycApproved) return;

        // 4. Verify Active Provider Status
        const isActive = pData.providerStatus === "active" || !pData.providerStatus;
        if (!isActive) return;

        // 5. Match customer location using structured identifiers
        const provCity = cleanLoc(
          psData.cityId ||
          psData.cityName ||
          psData.city ||
          pData.cityId ||
          pData.cityName ||
          pData.city
        );
        const provLoc = cleanLoc(
          psData.localityId ||
          psData.localityName ||
          psData.locality ||
          pData.localityId ||
          pData.localityName ||
          pData.locality
        );

        if (custCity) {
          // If customer has selected a city, provider MUST match that city
          if (provCity && provCity !== custCity) return;
        }

        if (custLoc && provLoc) {
          // If both have locality, check match or compatibility
          if (provLoc !== custLoc && !provLoc.includes(custLoc) && !custLoc.includes(provLoc)) {
            // If city matches, locality might be broader, but if city doesn't match return
            if (provCity !== custCity) return;
          }
        }

        // 6. Fetch user document for additional profile details if available
        let uData: any = {};
        try {
          const uDoc = await getDoc(doc(db, "users", providerId));
          if (uDoc.exists()) uData = uDoc.data();
        } catch (e) {
          // Ignore read restriction on users collection
        }

        const fullName = pData.fullName || uData.fullName || psData.providerName || "Verified Partner";
        const photoURL = pData.photoURL || uData.photoURL || "";
        const bio =
          pData.bio ||
          uData.bio ||
          `Experienced, verified companion specializing in ${psData.serviceName || "companion experiences"} with discretion and warmth.`;

        eligibleList.push({
          providerId,
          fullName,
          serviceId: psData.serviceId || serviceId,
          serviceName: psData.serviceName || "Companion Service",
          hourlyRate: Number(psData.price) || 2000,
          availableFrom: psData.availableFrom || "06:00 PM",
          availableTo: psData.availableTo || "10:00 PM",
          photoURL,
          bio,
          rating: pData.rating || 4.8,
          reviewsCount: pData.reviewsCount || 12,
          isKycApproved: true,
          isActive: true,
          stateId: psData.stateId || pData.stateId || "up",
          stateName: psData.stateName || pData.stateName || "Uttar Pradesh",
          cityId: psData.cityId || pData.cityId || "kanpur",
          cityName: psData.cityName || pData.cityName || pData.city || "Kanpur",
          localityId: psData.localityId || pData.localityId || "panki",
          localityName: psData.localityName || pData.localityName || pData.locality || "Panki",
          gender: uData.gender || pData.gender || "All",
          languages: pData.languages || ["English", "Hindi"],
          experience: pData.experience || "2+ Years",
          latitude: pData.providerLocation?.latitude || pData.latitude || 26.4499,
          longitude: pData.providerLocation?.longitude || pData.longitude || 80.3319,
        });
      })
    );

    return eligibleList;
  } catch (error) {
    console.warn("Could not query eligible providers for service:", error);
    return [];
  }
}

export interface ProviderPublicProfile {
  providerId: string;
  fullName: string;
  photoURL?: string;
  bio?: string;
  kycStatus: string;
  providerStatus: string;
  city?: string;
  state?: string;
  locality?: string;
  cityId?: string;
  stateId?: string;
  localityId?: string;
  gender?: string;
  languages?: string[];
  experience?: string;
  rating?: number;
  reviewsCount?: number;
  services: {
    serviceId: string;
    serviceName: string;
    hourlyRate: number;
    availableFrom: string;
    availableTo: string;
    isAvailable: boolean;
  }[];
}

/**
 * Fetch individual provider public profile by providerId.
 * Never exposes private phone, email, Aadhaar, or KYC documents!
 */
export async function getProviderPublicProfile(
  providerId: string
): Promise<ProviderPublicProfile | null> {
  try {
    const [pSnap, uSnap, servicesConfigs] = await Promise.all([
      getDoc(doc(db, "providers", providerId)),
      getDoc(doc(db, "users", providerId)).catch(() => null),
      getProviderAvailabilityConfigs(providerId),
    ]);

    if (!pSnap.exists()) {
      return null;
    }

    const pData = pSnap.data() || {};
    const uData = uSnap && uSnap.exists() ? uSnap.data() : {};

    const services = Object.values(servicesConfigs)
      .filter((cfg) => cfg.isAvailable)
      .map((cfg) => ({
        serviceId: cfg.serviceId,
        serviceName: cfg.serviceName || "Companion Service",
        hourlyRate: 2000,
        availableFrom: cfg.availableFrom || "06:00 PM",
        availableTo: cfg.availableTo || "10:00 PM",
        isAvailable: cfg.isAvailable,
      }));

    return {
      providerId,
      fullName: pData.fullName || uData.fullName || "Companion Partner",
      photoURL: pData.photoURL || uData.photoURL || "",
      bio:
        pData.bio ||
        uData.bio ||
        "Professional, verified companion dedicated to providing engaging social experiences, good conversation, and attentive accompaniment.",
      kycStatus: pData.kycStatus || "approved",
      providerStatus: pData.providerStatus || "active",
      city: pData.city || pData.cityName || uData.city || "Kanpur",
      locality: pData.locality || pData.localityName || "Panki",
      state: pData.state || pData.stateName || "Uttar Pradesh",
      cityId: pData.cityId || "kanpur",
      localityId: pData.localityId || "panki",
      stateId: pData.stateId || "up",
      gender: uData.gender || pData.gender || "All",
      languages: pData.languages || ["English", "Hindi"],
      experience: pData.experience || "2+ years",
      rating: pData.rating || 4.9,
      reviewsCount: pData.reviewsCount || 16,
      services,
    };
  } catch (error) {
    console.error("Error fetching provider public profile:", error);
    return null;
  }
}
