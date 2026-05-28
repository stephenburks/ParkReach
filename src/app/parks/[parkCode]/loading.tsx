export default function ParkDetailLoading() {
	return (
		<div className="min-h-screen bg-park-cream dark:bg-park-bark animate-pulse">
			{/* Header */}
			<div className="bg-park-forest h-[68px]" />

			{/* Hero image */}
			<div className="h-72 sm:h-96 bg-stone-300 dark:bg-stone-700" />

			<div className="max-w-full lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Main content */}
				<div className="lg:col-span-2 space-y-6">
					<div className="space-y-3">
						<div className="h-5 bg-stone-200 dark:bg-stone-700 rounded w-24" />
						<div className="h-8 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
						<div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
					</div>

					<div className="space-y-2">
						<div className="h-4 bg-stone-200 dark:bg-stone-700 rounded" />
						<div className="h-4 bg-stone-200 dark:bg-stone-700 rounded" />
						<div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-4/5" />
					</div>

					<div className="space-y-2">
						<div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-40 mb-3" />
						<div className="h-4 bg-stone-200 dark:bg-stone-700 rounded" />
						<div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
					</div>
				</div>

				{/* Sidebar */}
				<div className="space-y-4">
					<div className="bg-white dark:bg-stone-800 rounded-xl p-4 space-y-3">
						<div className="h-5 bg-stone-200 dark:bg-stone-700 rounded w-28" />
						<div className="h-4 bg-stone-200 dark:bg-stone-700 rounded" />
						<div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-2/3" />
					</div>
					<div className="bg-white dark:bg-stone-800 rounded-xl p-4 space-y-3">
						<div className="h-5 bg-stone-200 dark:bg-stone-700 rounded w-32" />
						<div className="h-4 bg-stone-200 dark:bg-stone-700 rounded" />
						<div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
					</div>
				</div>
			</div>
		</div>
	)
}
