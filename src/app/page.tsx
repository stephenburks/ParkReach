'use client';

import { useState, useEffect, useCallback } from 'react';
import { Park, NpsApiResponse } from '@/types/park';
import ParkCard from '@/components/ParkCard';
import ParkModal from '@/components/ParkModal';
import SearchFilter from '@/components/SearchFilter';
import { AuthButton } from '@/components/AuthButton';
import { AuthModal } from '@/components/AuthModal';
import { DarkModeToggle } from '@/components/DarkModeToggle';

const LIMIT = 24;

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

export default function Home() {
  const [parks, setParks] = useState<Park[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [stateCode, setStateCode] = useState('');
  const [designation, setDesignation] = useState('All');
  const [selectedPark, setSelectedPark] = useState<Park | null>(null);
  const [start, setStart] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchParks = useCallback(async (
    q: string,
    state: string,
    desig: string,
    startAt: number,
    append: boolean
  ) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError(null);

    try {
      // Fetch all parks and filter on client-side for accurate designation filtering
      const fetchParams = new URLSearchParams({ limit: '500', start: '0' });
      if (q) fetchParams.set('q', q);
      if (state) fetchParams.set('stateCode', state);

      const res = await fetch(`/api/parks?${fetchParams}`);
      if (!res.ok) throw new Error('Failed to load parks');
      let data: NpsApiResponse = await res.json();

      // Filter by designation client-side - exact match
      if (desig && desig !== 'All') {
        // Convert display format to API format: "National Parks" -> "National Park"
        const apiDesig = desig.replace(/s$/, '');  // Remove trailing 's'
        const filter = apiDesig.toLowerCase();
        
        const filtered = data.data.filter((p) => 
          p.designation && p.designation.toLowerCase() === filter
        );
        data = {
          ...data,
          data: filtered,
          total: String(filtered.length),
        };
      }

      const sliced = data.data.slice(0, LIMIT);
      
      if (append) {
        setParks((prev) => [...prev, ...sliced]);
      } else {
        setParks(sliced);
      }
      setTotal(parseInt(data.total, 10));
      setStart(startAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchParks(search, stateCode, designation, 0, false);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, stateCode, designation, fetchParks]);

  const handleLoadMore = () => {
    fetchParks(search, stateCode, designation, start + LIMIT, true);
  };

  const hasMore = parks.length < total;

  function formatPlaceType(desig: string): string {
    if (desig === 'All') return 'places';
    const label = desig.replace(/^National /, '');
    return label + (label.endsWith('s') ? '' : 's');
  }

  return (
    <div className="min-h-screen bg-park-cream dark:bg-park-bark">
      {/* Header */}
      <header className="bg-park-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center text-3xl flex-shrink-0" aria-hidden="true">
                🏕️
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">National Parks Explorer</h1>
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
      />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results count */}
        {!loading && !error && (
          <p className="text-sm text-park-stone dark:text-stone-400 mb-6">
            {total > 0
              ? `Showing ${parks.length} of ${total} ${formatPlaceType(designation)}`
              : 'No places found — try a different search'}
          </p>
        )}

        {/* Error state */}
        {error && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4" aria-hidden="true">⛺</p>
            <p className="text-park-bark dark:text-park-cream font-semibold text-lg mb-2">Something went wrong</p>
            <p className="text-stone-500 text-sm">{error}</p>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : parks.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {parks.map((park) => (
                <ParkCard
                  key={park.id}
                  park={park}
                  onClick={() => setSelectedPark(park)}
                />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-park-forest hover:bg-park-bark text-white font-semibold rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-sm"
                >
                  {loadingMore ? 'Loading…' : `Load More Parks (${total - parks.length} remaining)`}
                </button>
              </div>
            )}
          </>
        ) : !error ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4" aria-hidden="true">🔭</p>
            <p className="text-park-bark dark:text-park-cream font-semibold text-lg mb-2">No places found</p>
            <p className="text-stone-500 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : null}
      </main>

      {/* Detail modal */}
      {selectedPark && (
        <ParkModal park={selectedPark} onClose={() => setSelectedPark(null)} />
      )}

      {/* Auth modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Footer */}
      <footer className="mt-16 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-xs text-park-stone dark:text-stone-400">
            Data provided by the{' '}
            <a href="https://www.nps.gov/subjects/developer/index.htm" target="_blank" rel="noopener noreferrer" className="text-park-forest hover:underline font-medium">
              National Park Service API
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
