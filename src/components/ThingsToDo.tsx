'use client'

import { useQuery } from '@tanstack/react-query'
import { Clock, DollarSign, User, ExternalLink } from 'lucide-react'
import type { NpsThingToDo } from '@/types/thingsToDo'
import { stripHtmlTags } from '@/lib/utils'

function ThingsToDoSkeleton() {
	return (
		<div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
			{[1, 2, 3, 4].map((i) => (
				<div key={i} className="h-32 motion-safe:animate-pulse rounded-lg bg-stone-200 dark:bg-stone-700" />
			))}
		</div>
	)
}

export function ThingsToDo({ parkCode }: { parkCode: string }) {
	const { data, isLoading } = useQuery<NpsThingToDo[]>({
		queryKey: ['thingstodo', parkCode],
		queryFn: async () => {
			const res = await fetch(`/api/thingstodo?parkCode=${parkCode}`)
			if (!res.ok) throw new Error('Failed to fetch')
			const json = await res.json()
			return json.data ?? []
		},
		staleTime: 6 * 60 * 60 * 1000,
		enabled: Boolean(parkCode),
	})

	if (isLoading) return <ThingsToDoSkeleton />
	if (!data?.length) return null

		return (
		<section id="things-to-do" aria-labelledby="things-to-do-heading" className="scroll-mt-24">
			<h2 id="things-to-do-heading" className="text-xl font-bold text-park-bark dark:text-park-cream mb-4">
				Things To Do
			</h2>
			<ul className="grid gap-4 sm:grid-cols-2" role="list">
				{data.map((thing) => (
					<li
						key={thing.id}
						className="rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 p-4 shadow-sm min-w-0 overflow-hidden"
					>
						<h3 className="font-medium text-park-bark dark:text-park-cream break-words">{thing.title}</h3>
						<p className="mt-1 text-sm text-stone-700 dark:text-stone-300 break-words line-clamp-3">
							{stripHtmlTags(thing.shortDescription)}
						</p>
						<div className="mt-3 flex flex-wrap gap-3 text-xs text-stone-500 dark:text-stone-400">
							{thing.duration && (
								<span className="flex items-center gap-1">
									<Clock className="h-3 w-3" aria-hidden="true" />
									{thing.duration}
								</span>
							)}
							{thing.doFeesApply === 'true' && (
								<span className="flex items-center gap-1">
									<DollarSign className="h-3 w-3" aria-hidden="true" />
									Fee required
								</span>
							)}
							{thing.ages?.length > 0 && (
								<span className="flex items-center gap-1">
									<User className="h-3 w-3" aria-hidden="true" />
									{thing.ages.join(', ')}
								</span>
							)}
						</div>
						{thing.accessibilityInformation && (
							<p className="mt-2 text-xs text-park-forest dark:text-park-sage break-words">
								{thing.accessibilityInformation}
							</p>
						)}
						{thing.url && (
							<a href={thing.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-park-forest hover:underline break-all">
								<ExternalLink className="h-3 w-3 flex-shrink-0" aria-hidden="true" /> View on NPS.gov
							</a>
						)}
					</li>
				))}
			</ul>
		</section>
	)
}
