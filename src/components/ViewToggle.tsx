'use client';

import { List, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewMode = 'list' | 'map';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('list')}
        aria-label="List view"
        aria-pressed={view === 'list'}
        className={view === 'list' ? 'bg-park-forest text-white' : 'text-stone-600 dark:text-stone-400'}
      >
        <List className="h-4 w-4 mr-1.5" />
        <span className="text-xs">List</span>
      </Button>
      <Button
        variant={view === 'map' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onChange('map')}
        aria-label="Map view"
        aria-pressed={view === 'map'}
        className={view === 'map' ? 'bg-park-forest text-white' : 'text-stone-600 dark:text-stone-400'}
      >
        <Map className="h-4 w-4 mr-1.5" />
        <span className="text-xs">Map</span>
      </Button>
    </div>
  );
}