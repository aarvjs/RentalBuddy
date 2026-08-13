import { ProviderKycStatus, ProviderAccountStatus } from "./service-provider";

export interface AdminProfile {
  uid: string;
  name?: string;
  fullName: string;
  email: string;
  mobile?: string;
  mobileNumber: string;
  role: "admin";
  status?: "active" | "suspended" | string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminUserListItem {
  uid: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  city: string;
  state?: string;
  pincode?: string;
  gender?: string;
  userType: "customer" | "provider" | "both";
  createdAt: string;
  photoURL?: string;
  status?: "active" | "suspended";
  bookingCount?: number;
}

export interface AdminProviderListItem {
  uid: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  city: string;
  state: string;
  pincode: string;
  role: "provider";
  kycStatus: ProviderKycStatus;
  providerStatus: ProviderAccountStatus;
  createdAt: string;
  photoURL?: string;
  servicesCount?: number;
  bookingsCount?: number;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  totalProviders: number;
  pendingKycCount: number;
  activeServicesCount: number;
  totalBookings: number;
  upcomingBookingsCount: number;
  completedBookingsCount: number;
  totalRevenue: number;
}

export interface AdminCityStat {
  city: string;
  state: string;
  userCount: number;
  providerCount: number;
  bookingCount: number;
}
