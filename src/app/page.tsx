import type { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

import { ParkOfTheDay } from "@/components/ParkOfTheDay";
import { ExplorerClient } from "@/components/ExplorerClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SiteHeader } from "@/components/SiteHeader";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "ParkReach — Discover America's National Parks",
  description:
    "Search, filter, and explore US national parks. Get live weather, driving distance, accessibility info, and save parks to your wishlist.",
  alternates: {
    canonical: "https://parkreach.app",
  },
  openGraph: {
    title: "ParkReach — Discover America's National Parks",
    description:
      "Search, filter, and explore US national parks. Get live weather, driving distance, accessibility info, and save parks to your wishlist.",
    url: "https://parkreach.app",
    type: "website",
  },
};

export default async function Home() {
  let defaultView = "cards";

  const supabase = await createClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("default_view")
        .eq("id", user.id)
        .single();
      if (profile?.default_view) defaultView = profile.default_view;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-park-cream dark:bg-park-bark">
      <SiteHeader />

      <ParkOfTheDay />

      <ErrorBoundary>
        <Suspense>
          <ExplorerClient defaultView={defaultView} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
