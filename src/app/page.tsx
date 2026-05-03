"use client";

import { useState, useEffect, useCallback } from "react";
import { Park } from "@/types/park";
import ParkCard from "@/components/ParkCard";
import ParkModal from "@/components/ParkModal";
import SearchFilter from "@/components/SearchFilter";
import { AuthButton } from "@/components/AuthButton";
import { AuthModal } from "@/components/AuthModal";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { useParks } from "@/hooks/useParks";

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-stone-800 rounded-2xl overflow-hidden shadow-sm border border-stone-100 dark:border-stone-700 animate-pulse">
      <div className="h-52 bg-stone-200 dark:bg-stone-700" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-full w-3/4" />
        <div className="h-3 bg-stone-100 dark:bg-stone-600 rounded-full w-1/3" />
        <div className="space-y-2">
          <div className="h-3 bg-stone-100 dark:bg-stone-600 rounded-full" />
          <div className="h-3 bg-stone-100 dark:bg-stone-600 rounded-full" />
          <div className="h-3 bg-stone-100 dark:bg-stone-600 rounded-full w-2/3" />
        </div>
      </div>
    </div>
  );
}

function formatPlaceType(desig: string): string {
  if (desig === "All") return "Places";
  const label = desig.replace(/^National /, "");
  return label + (label.endsWith("s") ? "" : "s");
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [designation, setDesignation] = useState("All");
  const [accessibility, setAccessibility] = useState("");
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSelectPark = useCallback(
    (park: Park) => setSelectedPark(park),
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    error,
    fetchNextPage,
    hasNextPage,
  } = useParks(debouncedSearch, stateCode, designation);

  const parks = data?.pages.flatMap((p) => p.data) ?? [];
  const total = parseInt(data?.pages[0]?.total ?? "0", 10);

  return (
    <div className="min-h-screen bg-park-cream dark:bg-park-bark">
      {/* Header */}
      <header className="bg-park-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
            </div>
            <div className="flex items-center gap-2">
              <AuthButton onSignInClick={() => setShowAuthModal(true)} />
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Search + Filter */}
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        stateCode={stateCode}
        onStateChange={setStateCode}
        designation={designation}
        onDesignationChange={setDesignation}
        accessibility={accessibility}
        onAccessibilityChange={setAccessibility}
      />

      {/* Main content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results count */}
        {!isLoading && !error && (
          <p className="text-sm text-park-stone dark:text-stone-400 mb-6" aria-live="polite">
            {total > 0
              ? `Showing ${parks.length} of ${total} ${formatPlaceType(designation)}`
              : "No places found — try a different search"}
          </p>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4" aria-hidden="true">
              ⛺
            </p>
            <p className="text-park-bark dark:text-park-cream font-semibold text-lg mb-2">
              Something went wrong
            </p>
            <p className="text-stone-500 text-sm">{error.message}</p>
          </div>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : parks.length > 0 ? (
          <>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {parks.map((park) => (
                <li key={park.id}>
                  <ParkCard
                    park={park}
                    onSelect={handleSelectPark}
                  />
                </li>
              ))}
            </ul>

            {/* Load more */}
            {hasNextPage && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-8 py-3 bg-park-forest hover:bg-park-bark text-white font-semibold rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest focus-visible:ring-offset-2"
                >
                  {isFetchingNextPage
                    ? "Loading…"
                    : `Load More Parks (${total - parks.length} remaining)`}
                </button>
              </div>
            )}
          </>
        ) : !error ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4" aria-hidden="true">
              🔭
            </p>
            <p className="text-park-bark dark:text-park-cream font-semibold text-lg mb-2">
              No places found
            </p>
            <p className="text-stone-500 text-sm">
              Try adjusting your search or filters
            </p>
          </div>
        ) : null}
      </main>

      {/* Detail modal */}
      {selectedPark && (
        <ParkModal park={selectedPark} onClose={() => setSelectedPark(null)} />
      )}

      {/* Auth modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-xs text-park-stone dark:text-stone-400">
            Data provided by the{" "}
            <a
              href="https://www.nps.gov/subjects/developer/index.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-park-forest hover:underline font-medium"
            >
              National Park Service API
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
