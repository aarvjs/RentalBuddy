export type ProviderKycStatus = "pending" | "approved" | "rejected" | "resubmission_required" | "not_submitted";
export type ProviderAccountStatus = "pending" | "active" | "suspended";

export interface ProviderProfile {
  uid: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: "provider";
  userType?: "customer" | "provider" | "both";
  kycStatus: ProviderKycStatus;
  providerStatus: ProviderAccountStatus;
  createdAt: string;
  updatedAt?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  stateId?: string;
  stateName?: string;
  cityId?: string;
  cityName?: string;
  localityId?: string;
  localityName?: string;
  locality?: string;
  providerLocation?: {
    country: string;
    state: string;
    city: string;
    locality: string;
    address: string;
    pincode: string;
    latitude: number;
    longitude: number;
    placeId?: string;
    stateId?: string;
    stateName?: string;
    cityId?: string;
    cityName?: string;
    localityId?: string;
    localityName?: string;
  };
  location?: {
    country: string;
    state: string;
    city: string;
    locality: string;
    address: string;
    pincode: string;
    latitude: number;
    longitude: number;
    placeId?: string;
    stateId?: string;
    stateName?: string;
    cityId?: string;
    cityName?: string;
    localityId?: string;
    localityName?: string;
  };
  bio?: string;
  photoURL?: string;
  phoneVerified?: boolean;
  phoneVerifiedAt?: string;
}

export interface ProviderKyc {
  uid: string;
  providerId?: string;
  profilePhoto: string;
  profilePhotoUrl?: string;
  fullName: string;
  mobileNumber: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  phoneVerifiedAt?: string;
  dob?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  aadhaarNumber: string;
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;
  addressProofUrl?: string;
  status: ProviderKycStatus;
  submittedAt: string;
  updatedAt?: string;
  rejectionReason?: string;
  resubmissionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  requestedAt?: string;
  requestedBy?: string;
}

export type PriceType = "hourly" | "daily" | "fixed";
export type ServiceStatus = "active" | "draft" | "paused";

export interface ProviderService {
  id: string;
  providerId: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  priceType: PriceType;
  duration: string;
  serviceImages: string[];
  availability: string;
  serviceArea: string;
  status: ServiceStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface ProviderAvailabilityConfig {
  providerId: string;
  serviceId: string;
  serviceName?: string;
  available: boolean;
  isAvailable: boolean;
  availableFrom?: string;
  availableTo?: string;
  contactNumber?: string;
  updatedAt?: string;
}

export type BookingStatus = "pending" | "upcoming" | "completed" | "cancelled";

export interface ProviderBooking {
  id: string;
  providerId: string;
  userId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAvatar?: string;
  serviceId?: string;
  serviceName: string;
  serviceImage?: string;
  date: string;
  time: string;
  duration: string;
  amount: number;
  status: BookingStatus;
  paymentStatus?: "paid" | "pending" | "failed";
  connectionStatus?: "waiting" | "connected" | "expired" | "blocked";
  connectionOtpHash?: string;
  connectionOtpExpiresAt?: string;
  connectionOtpAttempts?: number;
  connectionOtpUsed?: boolean;
  connectedAt?: string;
  connectionVerifiedBy?: string;
  providerPhone?: string;
  providerName?: string;
  cityName?: string;
  localityName?: string;
  stateName?: string;
  createdAt: string;
  notes?: string;
}

export interface EarningsSummary {
  totalEarnings: number;
  availableBalance: number;
  pendingEarnings: number;
  completedServicesCount: number;
}

export interface WithdrawalRecord {
  id: string;
  providerId: string;
  amount: number;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  accountHolderName: string;
  status: "pending" | "processed" | "rejected";
  createdAt: string;
}
