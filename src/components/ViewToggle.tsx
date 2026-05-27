'use client';

import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewMode = 'cards' | 'minimal';

interface ViewToggleProps {
	view: ViewMode;
	onChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
	return (
		<div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
			<Button
				variant={view === 'cards' ? 'default' : 'ghost'}
				size="sm"
				onClick={() => onChange('cards')}
				aria-label="Cards view"
				aria-pressed={view === 'cards'}
				className={view === 'cards' ? 'bg-park-forest text-white' : 'text-stone-600 dark:text-stone-400'}
			>
				<LayoutGrid className="h-4 w-4 mr-1.5" />
				<span className="text-xs">Cards</span>
			</Button>
			<Button
				variant={view === 'minimal' ? 'default' : 'ghost'}
				size="sm"
				onClick={() => onChange('minimal')}
				aria-label="Minimal view"
				aria-pressed={view === 'minimal'}
				className={view === 'minimal' ? 'bg-park-forest text-white' : 'text-stone-600 dark:text-stone-400'}
			>
				<List className="h-4 w-4 mr-1.5" />
				<span className="text-xs">Minimal</span>
			</Button>
		</div>
	);
}
