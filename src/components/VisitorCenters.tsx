'use client'

import { useQuery } from '@tanstack/react-query'
import { Building2, Clock } from 'lucide-react'
import type { NpsVisitorCenter } from '@/types/visitorCenter'

function VisitorCentersSkeleton() {
	return (
		<div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
			{[1, 2].map((i) => (
				<div key={i} className="h-40 motion-safe:animate-pulse rounded-lg bg-stone-200 dark:bg-stone-700" />
			))}
		</div>
	)
}

function formatHours(center: NpsVisitorCenter): string | null {
	const hours = center.operatingHours?.[0]
	if (!hours?.standardHours) return null

	const std = hours.standardHours
	const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
	const unique = [...new Set(days.map((d) => std[d]))].filter(Boolean)

	if (unique.length === 0) return null
	if (unique.length === 1) return `Daily: ${unique[0]}`

	// Show one example day range
	const first = unique[0]
	const last = unique[unique.length - 1]
	return `Hours vary (e.g., ${first} – ${last})`
}

export function VisitorCenters({ parkCode }: { parkCode: string }) {
	const { data, isLoading } = useQuery<NpsVisitorCenter[]>({
		queryKey: ['visitorcenters', parkCode],
		queryFn: async () => {
			const res = await fetch(`/api/visitorcenters?parkCode=${parkCode}`)
			if (!res.ok) throw new Error('Failed to fetch')
			const json = await res.json()
			return json.data ?? []
		},
		staleTime: 6 * 60 * 60 * 1000,
		enabled: Boolean(parkCode),
	})

	if (isLoading) return <VisitorCentersSkeleton />
	if (!data?.length) return null

	return (
		<section aria-labelledby="visitor-centers-heading">
			<h2 id="visitor-centers-heading" className="text-xl font-bold text-park-bark dark:text-park-cream mb-4">
				Visitor Centers
			</h2>
			<ul className="grid gap-4 sm:grid-cols-2" role="list">
				{data.map((center) => {
					const hoursText = formatHours(center)

					return (
						<li
							key={center.id}
							className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4"
						>
							<div className="flex items-start gap-2">
								<Building2 className="h-5 w-5 mt-0.5 text-park-forest dark:text-park-sage flex-shrink-0" aria-hidden="true" />
								<div className="min-w-0">
									<h3 className="font-medium text-park-bark dark:text-park-cream">
										{center.name}
									</h3>
									{center.description && (
										<p className="mt-1 text-sm text-stone-700 dark:text-stone-300 line-clamp-2">
											{center.description}
										</p>
									)}
								</div>
							</div>

							{hoursText && (
								<div className="mt-2 flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
									<Clock className="h-3 w-3" aria-hidden="true" />
									{hoursText}
								</div>
							)}

							{center.directionsInfo && (
								<p className="mt-2 text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
									{center.directionsInfo}
								</p>
							)}

							{center.directionsUrl && (
								<a
									href={center.directionsUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="mt-2 inline-block text-xs font-medium text-park-forest dark:text-park-sage hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest rounded"
								>
									Get directions
								</a>
							)}
						</li>
					)
				})}
			</ul>
		</section>
	)
}
