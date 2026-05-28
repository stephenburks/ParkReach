"use client";

import { useCallback, useMemo, useEffect, useRef } from "react";
import {
  useQueryState,
  parseAsString,
  parseAsStringLiteral,
  parseAsBoolean,
  debounce,
} from "nuqs";
import type { Park } from "@/types/park";
import type { A11yFilters } from "@/components/SearchFilter";
import ParkModal from "@/components/ParkModal";
import { SiteFooter } from "@/components/SiteFooter";
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

  // Accessibility filters (booleans, synced to URL)
  const [hasWheelchair, setHasWheelchair] = useQueryState(
    "wheelchair",
    parseAsBoolean.withDefault(false),
  );
  const [hasBraille, setHasBraille] = useQueryState(
    "braille",
    parseAsBoolean.withDefault(false),
  );
  const [hasAsl, setHasAsl] = useQueryState(
    "asl",
    parseAsBoolean.withDefault(false),
  );
  const [hasAudioDescription, setHasAudioDescription] = useQueryState(
    "audiodesc",
    parseAsBoolean.withDefault(false),
  );

  const a11yFilters: A11yFilters = useMemo(() => ({
    hasWheelchair,
    hasBraille,
    hasAsl,
    hasAudioDescription,
  }), [hasWheelchair, hasBraille, hasAsl, hasAudioDescription]);

  const handleA11yFilterChange = useCallback((key: keyof A11yFilters) => {
    const setters: Record<keyof A11yFilters, (v: boolean) => void> = {
      hasWheelchair: setHasWheelchair,
      hasBraille: setHasBraille,
      hasAsl: setHasAsl,
      hasAudioDescription: setHasAudioDescription,
    };
    const current = a11yFilters[key];
    setters[key](!current);
  }, [a11yFilters, setHasWheelchair, setHasBraille, setHasAsl, setHasAudioDescription]);

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
    a11yFilters,
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

  const hasFilters = Boolean(search || stateCode || designation !== "All"
    || hasWheelchair || hasBraille || hasAsl || hasAudioDescription)

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
        className="max-w-full lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
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
          a11yFilters={a11yFilters}
          onA11yFilterChange={handleA11yFilterChange}
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
              setHasWheelchair(false)
              setHasBraille(false)
              setHasAsl(false)
              setHasAudioDescription(false)
            }}
          />
        ) : null}
      </main>

      <p className="sr-only" aria-live="polite" role="status">
        {loadComplete ? `All ${parks.length} ${formatPlaceType(designation)} loaded. ${viewAnnouncement}` : viewAnnouncement}
      </p>

      {selectedParkData && (
        <ParkModal
          park={selectedParkData}
          onClose={() => setSelectedPark(null)}
        />
      )}

      <KeyboardHelp />

      <SiteFooter />
    </>
  );
}
