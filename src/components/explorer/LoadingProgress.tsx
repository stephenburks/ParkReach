interface LoadingProgressProps {
	loaded: number
	total: number
}

export function LoadingProgress({ loaded, total }: LoadingProgressProps) {
	const pct = total > 0 ? (loaded / total) * 100 : 0

	return (
		<div className="mt-6">
			<div
				className="h-1 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden"
				aria-hidden="true"
			>
				<div
					className="h-full bg-park-forest transition-all duration-500 ease-out rounded-full"
					style={{ width: `${pct}%` }}
				/>
			</div>
			<p
				className="text-sm text-park-stone dark:text-stone-400 mt-2 text-center"
				role="status"
			>
				Loading more parks…
			</p>
		</div>
	)
}
