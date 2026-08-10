import React from "react";
import { ServiceProviderLayout } from "@/components/service-provider/ServiceProviderLayout";

export const metadata = {
  title: "Service Provider Portal | RentasBuddy",
  description: "RentasBuddy Service Provider Portal - Manage services, bookings, earnings, and KYC verification.",
};

export default function RootServiceProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ServiceProviderLayout>{children}</ServiceProviderLayout>;
}
