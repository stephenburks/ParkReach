'use client'

import { useQuery } from '@tanstack/react-query'
import { Calendar, Clock, DollarSign, Tag } from 'lucide-react'
import type { NpsEvent } from '@/types/event'
import { stripHtmlTags } from '@/lib/utils'

function UpcomingEventsSkeleton() {
	return (
		<div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
			{[1, 2].map((i) => (
				<div key={i} className="h-36 motion-safe:animate-pulse rounded-lg bg-stone-200 dark:bg-stone-700" />
			))}
		</div>
	)
}

function formatEventDate(event: NpsEvent): string {
	const start = event.datestart
	const end = event.dateend

	if (!start) return ''

	const startDate = new Date(start)
	const options: Intl.DateTimeFormatOptions = {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	}

	if (end && end !== start) {
		const endDate = new Date(end)
		const sameMonth = startDate.getMonth() === endDate.getMonth() &&
			startDate.getFullYear() === endDate.getFullYear()

		if (sameMonth) {
			return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endDate.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`
		}
		return `${startDate.toLocaleDateString('en-US', options)} – ${endDate.toLocaleDateString('en-US', options)}`
	}

	return startDate.toLocaleDateString('en-US', options)
}

export function UpcomingEvents({ parkCode }: { parkCode: string }) {
	const { data, isLoading } = useQuery<NpsEvent[]>({
		queryKey: ['events', parkCode],
		queryFn: async () => {
			const res = await fetch(`/api/events?parkCode=${parkCode}`)
			if (!res.ok) throw new Error('Failed to fetch')
			const json = await res.json()
			return json.data ?? []
		},
		staleTime: 6 * 60 * 60 * 1000,
		enabled: Boolean(parkCode),
	})

	if (isLoading) return <UpcomingEventsSkeleton />
	if (!data?.length) return null

	return (
		<section id="events" aria-labelledby="upcoming-events-heading">
			<h2 id="upcoming-events-heading" className="text-xl font-bold text-park-bark dark:text-park-cream mb-4">
				Upcoming Events
			</h2>
			<ul className="grid gap-4 sm:grid-cols-2" role="list">
				{data.map((event) => {
					const eventDate = formatEventDate(event)

					return (
						<li
							key={event.id}
							className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4 shadow-sm"
						>
							<div className="flex items-start gap-2">
								<Calendar className="h-5 w-5 mt-0.5 text-park-forest dark:text-park-sage flex-shrink-0" aria-hidden="true" />
								<div className="min-w-0">
									<h3 className="font-medium text-park-bark dark:text-park-cream">
										{event.title}
									</h3>
									{event.description && (
										<p className="mt-1 text-sm text-stone-700 dark:text-stone-300 line-clamp-2">
											{stripHtmlTags(event.description)}
										</p>
									)}
								</div>
							</div>

							<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 dark:text-stone-400">
								{eventDate && (
									<span className="flex items-center gap-1">
										<Calendar className="h-3 w-3" aria-hidden="true" />
										{eventDate}
									</span>
								)}
								{event.category && (
									<span className="flex items-center gap-1">
										<Tag className="h-3 w-3" aria-hidden="true" />
										{event.category}
									</span>
								)}
								{event.times?.[0] && (
									<span className="flex items-center gap-1">
										<Clock className="h-3 w-3" aria-hidden="true" />
										{event.times[0].datestart} – {event.times[0].dateend}
									</span>
								)}
								{event.feeinfo && (
									<span className="flex items-center gap-1">
										<DollarSign className="h-3 w-3" aria-hidden="true" />
										{event.feeinfo}
									</span>
								)}
							</div>

							{event.isrecurring === 'true' && (
								<span className="mt-2 inline-block text-xs bg-park-sage/20 text-park-forest dark:text-park-sage px-2 py-0.5 rounded-full">
									Recurring
								</span>
							)}
						</li>
					)
				})}
			</ul>
		</section>
	)
}
