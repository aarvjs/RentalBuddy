import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/constants";
import { AuthProvider } from "@/lib/auth-context";
import { PublicLayoutWrapper } from "@/components/layout/PublicLayoutWrapper";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} | ${SITE_CONFIG.tagline}`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "Luxury Companionship",
    "VIP Social Partner",
    "Gala Escort Service",
    "Bespoke Travel Companion",
    "High Society Events",
    "Discreet Lifestyle Concierge",
    "Romantic Escapes",
  ],
  authors: [{ name: SITE_CONFIG.name }],
  robots: "index, follow",
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#FFF9FA] text-[#2E1065]">
        <AuthProvider>
          <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
