export function SkeletonCard() {
	return (
		<div
			className="bg-white dark:bg-stone-800 rounded-xl overflow-hidden shadow-sm border border-stone-200 dark:border-stone-700 motion-safe:animate-pulse"
			aria-hidden="true"
		>
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
	)
}

export function SkeletonGrid() {
	return (
		<>
			<p className="sr-only" role="status">
				Loading parks…
			</p>
			<div
				className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
				aria-hidden="true"
			>
				{Array.from({ length: 9 }).map((_value, index) => (
					<SkeletonCard key={index} />
				))}
			</div>
		</>
	)
}
