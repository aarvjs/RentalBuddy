"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { AdminProfile } from "@/types/admin";
import { logoutAdmin } from "@/lib/admin/admin-auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isPublicAuthPage =
    pathname === "/admin/login" || pathname === "/admin/registration";

  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAdminProfile(null);
        setLoading(false);
        if (!isPublicAuthPage) {
          router.push("/admin/login");
        }
        return;
      }

      try {
        // Fetch admins/{uid} document from Firestore
        const adminDocRef = doc(db, "admins", user.uid);
        const adminSnap = await getDoc(adminDocRef);

        if (adminSnap.exists() && adminSnap.data()?.role === "admin") {
          setAdminProfile(adminSnap.data() as AdminProfile);
          setAccessDenied(false);
        } else {
          setAccessDenied(true);
          setAdminProfile(null);
          if (!isPublicAuthPage) {
            setTimeout(() => {
              router.push("/admin/login");
            }, 1500);
          }
        }
      } catch (err) {
        console.error("Error verifying admin role:", err);
        setAccessDenied(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, isPublicAuthPage, pathname]);

  const handleLogout = async () => {
    await logoutAdmin();
    setAdminProfile(null);
    router.push("/admin/login");
  };

  // If on login or registration pages, render page content directly without sidebar layout shell
  if (isPublicAuthPage) {
    return <>{children}</>;
  }

  // Loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/40 to-pink-50/40 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-700 to-pink-600 flex items-center justify-center text-white shadow-xl shadow-purple-500/20 mb-4 animate-bounce">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-extrabold text-purple-950">Loading Admin Console...</p>
        <p className="text-xs text-purple-900/60 mt-1">Verifying administrator authorization credentials</p>
      </div>
    );
  }

  // Access Denied screen
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/40 to-pink-50/40 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 border border-rose-300 text-rose-600 flex items-center justify-center shadow-lg mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-purple-950 mb-2">Access Denied</h2>
        <p className="text-sm text-purple-900/70 max-w-md mb-4">
          You are not authorized to access the RentasBuddy Admin Panel. Only accounts registered in admins/{`{uid}`} with role === "admin" can access this portal.
        </p>
        <p className="text-xs font-semibold text-purple-600">Redirecting to Admin Login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-purple-50/30 to-pink-50/30 font-sans text-purple-950 flex flex-col lg:flex-row">
      {/* Admin Desktop & Mobile Sidebar */}
      <AdminSidebar
        admin={adminProfile}
        onLogout={handleLogout}
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      {/* Main Page Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          admin={adminProfile}
          onLogout={handleLogout}
          onToggleMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
