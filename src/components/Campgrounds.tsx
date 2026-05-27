'use client'

import { useQuery } from '@tanstack/react-query'
import { Tent, ExternalLink } from 'lucide-react'
import type { NpsCampground } from '@/types/campground'

function CampgroundsSkeleton() {
	return (
		<div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
			{[1, 2].map((i) => (
				<div key={i} className="h-48 motion-safe:animate-pulse rounded-lg bg-stone-200 dark:bg-stone-700" />
			))}
		</div>
	)
}

function formatSiteCount(campground: NpsCampground): string {
	const parts: string[] = []
	const reservable = parseInt(campground.numberOfSitesReservable, 10)
	const fcfn = parseInt(campground.numberOfSitesFirstComeFirstServe, 10)

	if (reservable > 0) parts.push(`${reservable} reservable`)
	if (fcfn > 0) parts.push(`${fcfn} first-come`)
	return parts.length > 0 ? `${parts.join(', ')} site${(reservable + fcfn) !== 1 ? 's' : ''}` : ''
}

export function Campgrounds({ parkCode }: { parkCode: string }) {
	const { data, isLoading } = useQuery<NpsCampground[]>({
		queryKey: ['campgrounds', parkCode],
		queryFn: async () => {
			const res = await fetch(`/api/campgrounds?parkCode=${parkCode}`)
			if (!res.ok) throw new Error('Failed to fetch')
			const json = await res.json()
			return json.data ?? []
		},
		staleTime: 6 * 60 * 60 * 1000,
		enabled: Boolean(parkCode),
	})

	if (isLoading) return <CampgroundsSkeleton />
	if (!data?.length) return null

	return (
		<section aria-labelledby="campgrounds-heading">
			<h2 id="campgrounds-heading" className="text-xl font-bold text-park-bark dark:text-park-cream mb-4">
				Campgrounds
			</h2>
			<ul className="grid gap-4 sm:grid-cols-2" role="list">
				{data.map((cg) => {
					const siteCount = formatSiteCount(cg)
					const hasAccessibility =
						cg.accessibility?.wheelchairAccess ||
						cg.accessibility?.additionalInfo

					return (
						<li
							key={cg.id}
							className="rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4"
						>
							<div className="flex items-start gap-2">
								<Tent className="h-5 w-5 mt-0.5 text-park-forest dark:text-park-sage flex-shrink-0" aria-hidden="true" />
								<div className="min-w-0">
									<h3 className="font-medium text-park-bark dark:text-park-cream">
										{cg.name}
									</h3>
									{cg.description && (
										<p className="mt-1 text-sm text-stone-700 dark:text-stone-300 line-clamp-2">
											{cg.description}
										</p>
									)}
								</div>
							</div>

							{siteCount && (
								<p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
									{siteCount}
								</p>
							)}

							{hasAccessibility && (
								<p className="mt-1 text-xs text-park-forest dark:text-park-sage line-clamp-2">
									{cg.accessibility?.wheelchairAccess}
									{cg.accessibility?.wheelchairAccess && cg.accessibility?.additionalInfo ? ' — ' : ''}
									{cg.accessibility?.additionalInfo}
								</p>
							)}

							{cg.reservationUrl && (
								<a
									href={cg.reservationUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-park-forest dark:text-park-sage hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest rounded"
								>
									<ExternalLink className="h-3 w-3" aria-hidden="true" />
									Reserve a site
								</a>
							)}

							{cg.directionsOverview && (
								<p className="mt-2 text-xs text-stone-500 dark:text-stone-400 line-clamp-2">
									{cg.directionsOverview}
								</p>
							)}
						</li>
					)
				})}
			</ul>
		</section>
	)
}
