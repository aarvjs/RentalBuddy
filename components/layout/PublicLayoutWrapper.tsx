"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthModal } from "@/components/auth/AuthModal";

export function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If path is a service provider or admin route, DO NOT render public website Navbar, Footer, or AuthModal
  const isIsolatedRoute = pathname?.startsWith("/service-provider") || pathname?.startsWith("/admin");

  if (isIsolatedRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <AuthModal />
    </>
  );
}
