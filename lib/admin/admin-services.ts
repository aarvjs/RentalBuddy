import { collection, getDocs, doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MasterServiceItem } from "@/lib/service-provider/provider-services";
import { ServiceStatus } from "@/types/service-provider";

export async function getAllServicesAdmin(): Promise<MasterServiceItem[]> {
  try {
    const snapshot = await getDocs(collection(db, "services"));
    const list: MasterServiceItem[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() } as MasterServiceItem);
    });
    return list;
  } catch (error) {
    console.warn("Could not fetch services for admin:", error);
    return [];
  }
}

export interface CreateMasterServiceInput {
  serviceName: string;
  category: string;
  description: string;
  price: number;
  priceType?: string;
  imageUrl?: string;
  status: ServiceStatus;
  address?: string;
  locality?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  stateId: string;
  stateName: string;
  cityId: string;
  cityName: string;
  localityId: string;
  localityName: string;
}

export function cleanUndefined<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val !== undefined) {
      if (val !== null && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
        cleaned[key] = cleanUndefined(val);
      } else {
        cleaned[key] = val;
      }
    }
  });
  return cleaned;
}

export async function createMasterServiceAdmin(input: CreateMasterServiceInput): Promise<MasterServiceItem> {
  const serviceId = `srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const defaultImage = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800";

  const fullAddr = input.address || `${input.localityName || input.locality || ""}, ${input.cityName || input.city || ""}, ${input.stateName || input.state || ""}, India`;
  const addr = input.address || `${input.localityName || input.locality || ""}, ${input.cityName || input.city || ""}`;

  const rawService: any = {
    id: serviceId,
    serviceName: input.serviceName.trim(),
    category: input.category?.trim() || "Social Companion",
    description: input.description.trim(),
    price: Number(input.price) || 0,
    priceType: input.priceType || "hourly",
    imageUrl: input.imageUrl?.trim() || defaultImage,
    status: input.status || "active",
    location: {
      fullAddress: fullAddr,
      country: input.country || "India",
      state: input.state || input.stateName || "",
      city: input.city || input.cityName || "",
      locality: input.locality || input.localityName || "",
      pincode: input.pincode || "",
      latitude: input.latitude ?? 26.4499,
      longitude: input.longitude ?? 80.3319,
    },
    address: addr,
    locality: input.locality || input.localityName || "",
    city: input.city || input.cityName || "",
    state: input.state || input.stateName || "",
    country: input.country || "India",
    pincode: input.pincode || "",
    latitude: input.latitude ?? 26.4499,
    longitude: input.longitude ?? 80.3319,
    placeId: input.placeId || `place_${Date.now()}`,
    stateId: input.stateId || "",
    stateName: input.stateName || "",
    cityId: input.cityId || "",
    cityName: input.cityName || "",
    localityId: input.localityId || "",
    localityName: input.localityName || "",
    createdAt: new Date().toISOString(),
  };

  const newService = cleanUndefined(rawService) as MasterServiceItem;
  await setDoc(doc(db, "services", serviceId), newService);
  return newService;
}

export async function updateMasterServiceAdmin(
  serviceId: string,
  input: Partial<CreateMasterServiceInput>
): Promise<void> {
  const docRef = doc(db, "services", serviceId);

  const locAddress =
    input.address ||
    (input.localityName || input.locality
      ? `${input.localityName || input.locality}, ${input.cityName || input.city}`
      : input.cityName || input.city || "");

  const fullAddress =
    input.address ||
    (input.localityName || input.locality
      ? `${input.localityName || input.locality}, ${input.cityName || input.city}, ${input.stateName || input.state || ""}, India`
      : input.cityName || input.city || "India");

  const rawPayload: any = {
    ...input,
    updatedAt: new Date().toISOString(),
  };

  if (input.price !== undefined) rawPayload.price = Number(input.price);
  if (input.serviceName) rawPayload.serviceName = input.serviceName.trim();
  if (input.description) rawPayload.description = input.description.trim();
  if (input.imageUrl) rawPayload.imageUrl = input.imageUrl.trim();
  if (locAddress) rawPayload.address = locAddress;

  if (input.city || input.cityName || input.locality || input.localityName || input.address) {
    rawPayload.location = {
      fullAddress: fullAddress,
      country: input.country || "India",
      state: input.state || input.stateName || "",
      city: input.city || input.cityName || "",
      locality: input.locality || input.localityName || "",
      pincode: input.pincode || "",
      latitude: input.latitude ?? 26.4499,
      longitude: input.longitude ?? 80.3319,
    };
  }

  const payload = cleanUndefined(rawPayload);
  await updateDoc(docRef, payload);
}

export async function updateServiceStatusAdmin(
  serviceId: string,
  status: ServiceStatus
): Promise<void> {
  const docRef = doc(db, "services", serviceId);
  await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });
}
