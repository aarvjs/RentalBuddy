export type ProviderKycStatus = "pending" | "approved" | "rejected" | "not_submitted";
export type ProviderAccountStatus = "pending" | "active" | "suspended";

export interface ProviderProfile {
  uid: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  role: "provider";
  kycStatus: ProviderKycStatus;
  providerStatus: ProviderAccountStatus;
  createdAt: string;
  updatedAt?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  bio?: string;
  photoURL?: string;
}

export interface ProviderKyc {
  uid: string;
  profilePhoto: string;
  fullName: string;
  mobileNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  aadhaarNumber: string;
  aadhaarFrontUrl: string;
  aadhaarBackUrl: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  rejectionReason?: string;
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
