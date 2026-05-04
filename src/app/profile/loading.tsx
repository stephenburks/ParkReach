export default function ProfileLoading() {
	return (
		<div className="min-h-screen bg-park-cream dark:bg-park-bark p-8">
			<div className="max-w-4xl mx-auto animate-pulse">
				<div className="mb-8">
					<div className="h-9 bg-stone-200 dark:bg-stone-700 rounded w-40 mb-2" />
					<div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-56" />
				</div>

				<div className="mb-12">
					<div className="h-7 bg-stone-200 dark:bg-stone-700 rounded w-32 mb-4" />
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{Array.from({ length: 3 }).map((_value, index) => (
							<div key={index} className="bg-white dark:bg-stone-800 rounded-lg h-16" />
						))}
					</div>
				</div>

				<div>
					<div className="h-7 bg-stone-200 dark:bg-stone-700 rounded w-28 mb-4" />
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{Array.from({ length: 3 }).map((_value, index) => (
							<div key={index} className="bg-white dark:bg-stone-800 rounded-lg h-16" />
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
