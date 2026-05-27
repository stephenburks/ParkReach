import { Map } from 'lucide-react'
import type { Park } from '@/types/park'

interface Props {
	parks: Park[]
	onParkSelect: (park: Park) => void
}

export function ParkMap({ parks, onParkSelect: _onParkSelect }: Props) {
	return (
		<div className="h-[600px] flex flex-col items-center justify-center bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 gap-3">
			<Map className="h-12 w-12 text-park-stone dark:text-stone-400" aria-hidden="true" />
			<p className="text-park-stone dark:text-stone-400 font-medium">Map View</p>
			<p className="text-xs text-stone-600 dark:text-stone-400 max-w-xs text-center">
				Interactive maps are coming soon. You can still browse {parks.length} parks in card
				or list view using the toggle above.
			</p>
		</div>
	)
}
