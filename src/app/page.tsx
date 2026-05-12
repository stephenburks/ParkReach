import type { Metadata } from "next";
import Link from "next/link";
import { ParkOfTheDay } from "@/components/ParkOfTheDay";
import { ExplorerClient } from "@/components/ExplorerClient";
import { HeaderControls } from "@/components/HeaderControls";
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
    <div className="min-h-screen bg-park-cream dark:bg-park-bark">
      {/* Header */}
      <header className="bg-park-forest text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg">
              <div
                className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center text-3xl flex-shrink-0"
                aria-hidden="true"
              >
                🏕️
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                  ParkReach
                </h1>
                <p className="text-park-cream/70 mt-1 text-sm sm:text-base">
                  Discover America&apos;s natural and cultural treasures
                </p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <HeaderControls />
            </div>
          </div>
        </div>
      </header>

      <ParkOfTheDay />

      <ExplorerClient defaultView={defaultView} />
    </div>
  );
}
