import { Search } from 'lucide-react'

interface EmptyStateProps {
	hasFilters: boolean
	onClearFilters?: () => void
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
	return (
		<div
			role="status"
			className="flex flex-col items-center justify-center py-24 text-center text-park-stone dark:text-park-cream/60"
		>
			<Search className="mb-4 h-12 w-12 opacity-30" aria-hidden="true" />
			<p className="text-lg font-medium text-park-bark dark:text-park-cream">No parks found</p>
			{hasFilters && (
				<button
					type="button"
					onClick={onClearFilters}
					className="mt-4 text-sm underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest"
				>
					Clear all filters
				</button>
			)}
		</div>
	)
}
