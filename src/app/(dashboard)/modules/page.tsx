// src/app/(dashboard)/modules/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useActiveFeatures } from "@/hooks/useFeatures";
import { HUB_MODULES } from "@/lib/hub-modules";
import { Spinner } from "@/components/ui";

export default function ModulesIndexPage() {
  const { features, isLoading } = useActiveFeatures();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const first = HUB_MODULES.find((m) => features.some((f) => f.slug === m.slug && f.is_active));
    if (first) router.replace(`/modules/${first.path}`);
  }, [features, isLoading, router]);

  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Spinner />
    </div>
  );
}