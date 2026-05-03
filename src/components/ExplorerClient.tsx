"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import {
  useQueryState,
  parseAsString,
  parseAsStringLiteral,
  debounce,
} from "nuqs";
import type { Park } from "@/types/park";
import ParkCard from "@/components/ParkCard";
import ParkCardMinimal from "@/components/ParkCardMinimal";
import ParkModal from "@/components/ParkModal";
import SearchFilter from "@/components/SearchFilter";
import { useParks } from "@/hooks/useParks";
import { ViewToggle } from "@/components/ViewToggle";

interface ParkMapProps {
  parks: Park[];
  onParkSelect: (park: Park) => void;
}

const ParkMap = dynamic(
  () => import("@/components/ParkMap").then((m) => ({ default: m.ParkMap })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] flex items-center justify-center bg-stone-100 dark:bg-stone-800 rounded-xl">
        <p className="text-park-stone">Loading map…</p>
      </div>
    ),
  },
) as ComponentType<ParkMapProps>;

const VIEW_OPTIONS = ["cards", "minimal", "map"] as const;

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

export function ExplorerClient() {
  const [search, setSearch] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ limitUrlUpdates: debounce(300) }),
  );
  const [stateCode, setStateCode] = useQueryState(
    "state",
    parseAsString.withDefault(""),
  );
  const [designation, setDesignation] = useQueryState(
    "desig",
    parseAsString.withDefault("All"),
  );
  const [accessibility, setAccessibility] = useQueryState(
    "acc",
    parseAsString.withDefault(""),
  );
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(VIEW_OPTIONS).withDefault("cards"),
  );

  const [selectedPark, setSelectedPark] = useQueryState("park");

  const handleSelectPark = useCallback(
    (park: Park) => setSelectedPark(park.parkCode),
    [setSelectedPark],
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    error,
    fetchNextPage,
    hasNextPage,
  } = useParks(search, stateCode, designation);

  const parks = data?.pages.flatMap((p) => p.data) ?? [];
  const total = parseInt(data?.pages[0]?.total ?? "0", 10);

  const accessibilityFilteredParks = accessibility
    ? parks.filter(
        (p) =>
          p.accessibility
            ?.toLowerCase()
            .includes(accessibility.toLowerCase()) ?? false,
      )
    : parks;

  const selectedParkData = selectedPark
    ? (parks.find((p) => p.parkCode === selectedPark) ?? null)
    : null;

  return (
    <>
      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
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

        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          {!isLoading && !error && (
            <p
              className="text-sm text-park-stone dark:text-stone-400"
              aria-live="polite"
            >
              {total > 0
                ? `Showing ${accessibilityFilteredParks.length} of ${total} ${formatPlaceType(designation)}`
                : "No places found — try a different search"}
            </p>
          )}
          <ViewToggle view={view} onChange={setView} />
        </div>

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

        {/* Content based on view */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : accessibilityFilteredParks.length > 0 ? (
          <>
            {view === "cards" && (
              <ul
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                role="list"
              >
                {accessibilityFilteredParks.map((park) => (
                  <li key={park.id}>
                    <ParkCard park={park} onSelect={handleSelectPark} />
                  </li>
                ))}
              </ul>
            )}
            {view === "minimal" && (
              <>
                <ul
                  className="divide-y divide-stone-100 dark:divide-stone-700"
                  role="list"
                >
                  {accessibilityFilteredParks.map((park) => (
                    <li key={park.id}>
                      <ParkCardMinimal
                        park={park}
                        onSelect={handleSelectPark}
                      />
                    </li>
                  ))}
                </ul>
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
            )}
            {view === "map" && (
              <>
                <a
                  href="#main-content"
                  className="text-xs text-park-forest hover:underline mb-2 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest"
                >
                  Skip map, view as list
                </a>
                <ParkMap
                  parks={accessibilityFilteredParks}
                  onParkSelect={handleSelectPark}
                />
              </>
            )}

            {view === "cards" && hasNextPage && (
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

      {selectedParkData && (
        <ParkModal
          park={selectedParkData}
          onClose={() => setSelectedPark(null)}
        />
      )}

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
    </>
  );
}
