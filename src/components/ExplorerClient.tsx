"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { useCallback, useMemo } from "react";
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
import { useAuth } from "@/context/AuthContext";

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
type ViewOption = typeof VIEW_OPTIONS[number];

function SkeletonCard() {
  return (
    <div
      className="bg-white dark:bg-stone-800 rounded-2xl overflow-hidden shadow-sm border border-stone-100 dark:border-stone-700 animate-pulse"
      aria-hidden="true"
    >
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

function SkeletonGrid() {
  return (
    <>
      <p className="sr-only" role="status">
        Loading parks…
      </p>
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        aria-hidden="true"
      >
        {Array.from({ length: 9 }).map((_value, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </>
  );
}

function BackgroundLoadingIndicator({
  loaded,
  total,
}: {
  loaded: number;
  total: number;
}) {
  const pct = total > 0 ? (loaded / total) * 100 : 0;

  return (
    <div className="mt-6">
      <div
        className="h-1 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="h-full bg-park-forest transition-all duration-500 ease-out rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p
        className="text-sm text-park-stone dark:text-stone-400 mt-2 text-center"
        role="status"
      >
        Loading more parks…
      </p>
    </div>
  );
}

function EmptyState() {
  return (
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
  );
}

interface ErrorStateProps {
  message: string;
}

function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="text-center py-16">
      <p className="text-5xl mb-4" aria-hidden="true">
        ⛺
      </p>
      <p className="text-park-bark dark:text-park-cream font-semibold text-lg mb-2">
        Something went wrong
      </p>
      <p className="text-stone-500 text-sm">{message}</p>
    </div>
  );
}

function formatPlaceType(desig: string): string {
  if (desig === "All") return "Places";
  const label = desig.replace(/^National /, "");
  return label + (label.endsWith("s") ? "" : "s");
}

interface ExplorerClientProps {
  defaultView?: string;
}

export function ExplorerClient({ defaultView = "cards" }: ExplorerClientProps) {
  const { supabase, user } = useAuth();
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

  const safeDefault: ViewOption = VIEW_OPTIONS.includes(defaultView as ViewOption)
    ? (defaultView as ViewOption)
    : "cards";
  const viewParser = useMemo(
    () => parseAsStringLiteral(VIEW_OPTIONS).withDefault(safeDefault),
    [safeDefault],
  );
  const [view, setViewParam] = useQueryState("view", viewParser);

  const setView = useCallback(
    async (newView: ViewOption) => {
      setViewParam(newView);
      if (supabase && user) {
        await supabase.from("profiles").update({ default_view: newView }).eq("id", user.id);
      }
    },
    [setViewParam, supabase, user],
  );

  const [selectedPark, setSelectedPark] = useQueryState("park");

  const handleSelectPark = useCallback(
    (park: Park) => setSelectedPark(park.parkCode),
    [setSelectedPark],
  );

  const { parks, total, isLoading, isBackgroundLoading, error, designations } = useParks(
    search,
    stateCode,
    designation,
  );

  const selectedParkData = selectedPark
    ? (parks.find((park) => park.parkCode === selectedPark) ?? null)
    : null;

  const countText =
    total > 0
      ? isBackgroundLoading
        ? `Showing ${parks.length} of ${total} ${formatPlaceType(designation)} — loading more…`
        : `Showing ${parks.length} ${formatPlaceType(designation)}`
      : "No places found — try a different search";

  const loadComplete = !isLoading && !isBackgroundLoading && parks.length > 0;

  return (
    <>
      <main
        id="main-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <SearchFilter
          search={search}
          onSearchChange={setSearch}
          stateCode={stateCode}
          onStateChange={setStateCode}
          designation={designation}
          onDesignationChange={setDesignation}
          designations={designations}
        />

        <div className="flex items-center justify-between mb-6">
          {!isLoading && !error && (
            <p
              className="text-sm text-park-stone dark:text-stone-400"
              aria-live="polite"
            >
              {countText}
            </p>
          )}
          <ViewToggle view={view} onChange={setView} />
        </div>

        {error && <ErrorState message={error.message} />}

        {isLoading ? (
          <SkeletonGrid />
        ) : parks.length > 0 ? (
          <>
            {view === "cards" && (
              <ul
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                role="list"
              >
                {parks.map((park) => (
                  <li key={park.id}>
                    <ParkCard park={park} onSelect={handleSelectPark} />
                  </li>
                ))}
              </ul>
            )}
            {view === "minimal" && (
              <ul
                className="divide-y divide-stone-100 dark:divide-stone-700"
                role="list"
              >
                {parks.map((park) => (
                  <li key={park.id}>
                    <ParkCardMinimal
                      park={park}
                      onSelect={handleSelectPark}
                    />
                  </li>
                ))}
              </ul>
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
                  parks={parks}
                  onParkSelect={handleSelectPark}
                />
              </>
            )}

            {isBackgroundLoading && (view === "cards" || view === "minimal") && (
              <BackgroundLoadingIndicator
                loaded={parks.length}
                total={total}
              />
            )}
          </>
        ) : !error ? (
          <EmptyState />
        ) : null}
      </main>

      <p className="sr-only" aria-live="polite" role="status">
        {loadComplete ? `All ${parks.length} ${formatPlaceType(designation)} loaded.` : ''}
      </p>

      {selectedParkData && (
        <ParkModal
          park={selectedParkData}
          onClose={() => setSelectedPark(null)}
        />
      )}

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
