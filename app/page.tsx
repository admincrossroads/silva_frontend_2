"use client";

import { useEffect, useState } from "react";
import { CropfortLandingPage } from "@/components/marketing/cropfort-landing/cropfort-landing-page";
import { useAuthStore } from "@/stores/auth-store";

export default function HomePage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <CropfortLandingPage signedIn={mounted && Boolean(accessToken)} />;
}
