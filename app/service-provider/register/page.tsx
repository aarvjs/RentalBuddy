"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ServiceProviderRegisterRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/register?type=provider");
  }, [router]);

  return null;
}
