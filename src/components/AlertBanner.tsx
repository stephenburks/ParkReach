'use client'

import { useAlerts } from '@/hooks/useAlerts'
import type { NpsAlert } from '@/types/alert'

const bannerStyle: Record<NpsAlert['category'], string> = {
	'Park Closure':
		'border-red-600 bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100',
	Danger:
		'border-red-500 bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-100',
	Caution:
		'border-amber-500 bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-100',
	Information:
		'border-blue-400 bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100',
}

export function AlertBanner({ parkCode }: { parkCode: string }) {
	const { data: alerts = [] } = useAlerts(parkCode)
	if (alerts.length === 0) return null

	return (
		<section aria-label="Park alerts" className="space-y-2">
			{alerts.map((alert) => (
				<div
					key={alert.id}
					role="alert"
					className={`rounded-lg border-l-4 p-4 ${bannerStyle[alert.category]}`}
				>
					<p className="font-semibold">{alert.title}</p>
					<p className="mt-1 text-sm">{alert.description}</p>
					{alert.url && (
						<a
							href={alert.url}
							className="mt-1 text-sm underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							More information
						</a>
					)}
				</div>
			))}
		</section>
	)
}
