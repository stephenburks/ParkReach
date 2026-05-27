export function SiteFooter() {
	return (
		<footer className="mt-16 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
				<p className="text-xs text-park-stone dark:text-stone-400">
					Data provided by the{' '}
					<a
						href="https://www.nps.gov/subjects/developer/index.htm"
						target="_blank"
						rel="noopener noreferrer"
						className="text-park-forest hover:underline font-medium"
					>
						National Park Service API
					</a>
				</p>
				<p className="text-xs text-park-stone dark:text-stone-400 mt-1.5">
					Press{' '}
					<kbd className="px-1 py-0.5 rounded border border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-700 font-mono text-[10px] text-park-bark dark:text-park-cream">
						?
					</kbd>{' '}
					for keyboard shortcuts
				</p>
			</div>
		</footer>
	)
}
