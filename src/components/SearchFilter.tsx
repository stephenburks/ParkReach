'use client';

import { Search, X } from 'lucide-react';
import { US_STATES } from '@/lib/constants/geography';
import { FALLBACK_DESIGNATIONS } from '@/lib/constants/designations';

function formatDesignationLabel(desig: string): string {
  if (desig === 'All') return 'All';
  return desig.replace(/^National /, '');
}

export interface A11yFilters {
  hasWheelchair: boolean;
  hasBraille: boolean;
  hasAsl: boolean;
  hasAudioDescription: boolean;
}

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  stateCode: string;
  onStateChange: (v: string) => void;
  designation: string;
  onDesignationChange: (v: string) => void;
  designations: string[];
  a11yFilters: A11yFilters;
  onA11yFilterChange: (key: keyof A11yFilters) => void;
}

const A11Y_CHECKBOXES: Array<{ key: keyof A11yFilters; label: string }> = [
  { key: 'hasWheelchair', label: 'Wheelchair Accessible' },
  { key: 'hasBraille', label: 'Braille' },
  { key: 'hasAsl', label: 'ASL' },
  { key: 'hasAudioDescription', label: 'Audio Description' },
];

export default function SearchFilter({
  search,
  onSearchChange,
  stateCode,
  onStateChange,
  designation,
  onDesignationChange,
  designations,
  a11yFilters,
  onA11yFilterChange,
}: Props) {
  const displayDesignations = designations.length > 1 ? designations : FALLBACK_DESIGNATIONS;
  return (
    <div className="sticky top-0 z-40 bg-park-cream/95 dark:bg-park-bark/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
        {/* Search + State row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <label htmlFor="park-search" className="sr-only">Search parks</label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-park-stone dark:text-stone-400" aria-hidden="true" />
            <input
              id="park-search"
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search parks by name or keyword..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-park-bark dark:text-park-cream placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-park-sage focus:border-transparent text-sm shadow-sm"
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-stone-400 hover:text-park-bark dark:hover:text-park-cream transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <label htmlFor="park-state" className="sr-only">Filter by state or territory</label>
          <select
            id="park-state"
            value={stateCode}
            onChange={(event) => onStateChange(event.target.value)}
            className="sm:w-52 px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-park-bark dark:text-park-cream focus:outline-none focus:ring-2 focus:ring-park-sage focus:border-transparent text-sm shadow-sm appearance-none cursor-pointer"
          >
            <option value="">All States & Territories</option>
            {US_STATES.map((state) => (
              <option key={state.code} value={state.code}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        {/* Designation tabs */}
        <fieldset className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide border-0 p-0 min-w-0 w-full">
          <legend className="sr-only">Filter by designation</legend>
          {displayDesignations.map((desig) => (
            <button
              key={desig}
              onClick={() => onDesignationChange(desig)}
              aria-pressed={designation === desig}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                designation === desig
                  ? 'bg-park-forest text-white shadow-sm'
                  : 'bg-white dark:bg-stone-800 text-park-stone dark:text-stone-400 border border-stone-200 dark:border-stone-600 hover:bg-park-sage/10 hover:text-park-bark dark:hover:text-park-cream hover:border-park-sage/40'
              }`}
            >
              {formatDesignationLabel(desig)}
            </button>
          ))}
        </fieldset>

        {/* Accessibility filters */}
        <fieldset className="border-0 p-0">
          <legend className="text-xs font-medium text-park-stone dark:text-stone-400 mb-2">
            Accessibility Features
          </legend>
          <div className="flex flex-wrap gap-3">
            {A11Y_CHECKBOXES.map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-1.5 text-xs text-park-stone dark:text-stone-400 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={a11yFilters[key]}
                  onChange={() => onA11yFilterChange(key)}
                  className="h-3.5 w-3.5 rounded border-stone-300 dark:border-stone-600 text-park-forest focus:ring-2 focus:ring-park-sage focus:ring-offset-0 cursor-pointer"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
