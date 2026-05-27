"use client";

import { useCallback, useMemo, useEffect, useRef } from "react";
import {
  useQueryState,
  parseAsString,
  parseAsStringLiteral,
  debounce,
} from "nuqs";
import type { Park } from "@/types/park";
import ParkModal from "@/components/ParkModal";
import { KeyboardHelp } from "@/components/KeyboardHelp";
import SearchFilter from "@/components/SearchFilter";
import { useParks } from "@/hooks/useParks";
import { ViewToggle } from "@/components/ViewToggle";
import { useAuth } from "@/context/AuthContext";
import { SkeletonGrid } from "@/components/explorer/SkeletonGrid";
import { EmptyState } from "@/components/explorer/EmptyState";
import { ErrorState } from "@/components/explorer/ErrorState";
import { LoadingProgress } from "@/components/explorer/LoadingProgress";
import { ParkGridView } from "@/components/explorer/ParkGridView";
import { ParkListView } from "@/components/explorer/ParkListView";

const VIEW_OPTIONS = ["cards", "minimal"] as const;
type ViewOption = typeof VIEW_OPTIONS[number];

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
  const resultsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isLoading && !isBackgroundLoading && resultsRef.current) {
      const firstResult = resultsRef.current.querySelector('li, [role="listitem"]')
      if (firstResult instanceof HTMLElement) {
        firstResult.focus()
      }
    }
  }, [view, isLoading, isBackgroundLoading])

  const viewLabel = view === "cards" ? "card" : "list";
  const viewAnnouncement = parks.length > 0
    ? `Showing ${parks.length} parks in ${viewLabel} view`
    : ''

  const hasFilters = Boolean(search || stateCode || designation !== "All")

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
        ref={resultsRef}
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
              <ParkGridView parks={parks} onParkSelect={handleSelectPark} />
            )}
            {view === "minimal" && (
              <ParkListView parks={parks} onParkSelect={handleSelectPark} />
            )}

            {isBackgroundLoading && (view === "cards" || view === "minimal") && (
              <LoadingProgress
                loaded={parks.length}
                total={total}
              />
            )}
          </>
        ) : !error ? (
          <EmptyState
            hasFilters={hasFilters}
            onClearFilters={() => {
              setSearch("")
              setStateCode("")
              setDesignation("All")
            }}
          />
        ) : null}
      </main>

      <p className="sr-only" aria-live="polite" role="status">
        {loadComplete ? `All ${parks.length} ${formatPlaceType(designation)} loaded.` : ''}
      </p>

      <p className="sr-only" aria-live="polite" role="status">
        {viewAnnouncement}
      </p>

      {selectedParkData && (
        <ParkModal
          park={selectedParkData}
          onClose={() => setSelectedPark(null)}
        />
      )}

      <KeyboardHelp />

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
          <p className="text-xs text-park-stone dark:text-stone-400 mt-1.5">
            Press{" "}
            <kbd className="px-1 py-0.5 rounded border border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-700 font-mono text-[10px] text-park-bark dark:text-park-cream">?</kbd>{" "}
            for keyboard shortcuts
          </p>
        </div>
      </footer>
    </>
  );
}
