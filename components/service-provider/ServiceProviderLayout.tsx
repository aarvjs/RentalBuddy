"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ProviderProfile } from "@/types/service-provider";
import { logoutProvider } from "@/lib/service-provider/provider-auth";
import { ServiceProviderSidebar } from "./ServiceProviderSidebar";
import { ServiceProviderHeader } from "./ServiceProviderHeader";
import { ServiceProviderMobileNav } from "./ServiceProviderMobileNav";
import { Loader2, ShieldAlert } from "lucide-react";

export function ServiceProviderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isPublicAuthPage =
    pathname === "/service-provider/login" || pathname === "/service-provider/register";

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setProviderProfile(null);
        setLoading(false);
        if (!isPublicAuthPage) {
          router.push("/login");
        }
        return;
      }

      try {
        // Fetch providers/{uid} document
        const pRef = doc(db, "providers", user.uid);
        const pSnap = await getDoc(pRef);

        if (pSnap.exists()) {
          const data = pSnap.data() as ProviderProfile;
          if (data.role === "provider") {
            setProviderProfile(data);
            setAccessDenied(false);
          } else {
            // Document exists but role is not provider
            setAccessDenied(true);
            setTimeout(() => {
              router.push("/");
            }, 2500);
          }
        } else {
          // Check if user is in users/{uid} collection (normal customer account or dual account)
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.userType === "provider" || userData.userType === "both") {
              // Create provider profile fallback from user document
              const fallbackProvider: ProviderProfile = {
                uid: user.uid,
                fullName: userData.fullName || user.displayName || "Provider",
                email: user.email || "",
                mobileNumber: userData.mobileNumber || "",
                role: "provider",
                kycStatus: "pending",
                providerStatus: "pending",
                createdAt: userData.createdAt || new Date().toISOString(),
                city: userData.city || "",
                photoURL: userData.photoURL || user.photoURL || undefined,
              };
              try {
                await setDoc(pRef, fallbackProvider);
              } catch (e) {
                console.warn("Could not save fallback provider document:", e);
              }
              setProviderProfile(fallbackProvider);
              setAccessDenied(false);
            } else {
              // Customer trying to access provider portal
              setAccessDenied(true);
              setTimeout(() => {
                router.push("/");
              }, 2500);
            }
          } else {
            // Neither provider nor user doc exists - redirect unauthenticated
            if (!isPublicAuthPage) {
              setAccessDenied(true);
              setTimeout(() => {
                router.push("/");
              }, 2500);
            }
          }
        }
      } catch (err) {
        console.error("Error verifying provider role:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, isPublicAuthPage, pathname]);

  const handleLogout = async () => {
    await logoutProvider();
    setProviderProfile(null);
    setCurrentUser(null);
    router.push("/login");
  };

  // If on login or register pages, render directly without sidebar/header layout wrapper
  if (isPublicAuthPage) {
    return <>{children}</>;
  }

  // Loading state spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/50 to-purple-50/60 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-pink-500/20 mb-4 animate-bounce">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-extrabold text-purple-950">Loading Provider Console...</p>
        <p className="text-xs text-purple-900/60 mt-1">Verifying credentials and security status</p>
      </div>
    );
  }

  // Access denied screen for non-providers (e.g. customers trying to access provider dashboard)
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-pink-50/50 to-purple-50/60 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 border border-rose-300 text-rose-600 flex items-center justify-center shadow-lg mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-purple-950 mb-2">Access Denied</h2>
        <p className="text-sm text-purple-900/70 max-w-md mb-4">
          This area is strictly restricted to verified Service Provider accounts. Customer accounts cannot access the provider portal.
        </p>
        <p className="text-xs font-semibold text-pink-600">Redirecting to RentasBuddy main site...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-pink-50/30 to-purple-50/30 font-sans text-purple-950 flex flex-col lg:flex-row">
      {/* Desktop Sidebar Navigation */}
      <ServiceProviderSidebar provider={providerProfile} onLogout={handleLogout} />

      {/* Mobile Drawer Navigation */}
      <ServiceProviderMobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        provider={providerProfile}
        onLogout={handleLogout}
      />

      {/* Main Page Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <ServiceProviderHeader
          provider={providerProfile}
          onLogout={handleLogout}
          onToggleMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
