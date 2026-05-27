'use client'

import { useAlerts } from '@/hooks/useAlerts'
import type { NpsAlert } from '@/types/alert'

const categoryColor: Record<NpsAlert['category'], string> = {
	'Park Closure': 'bg-red-600 text-white dark:bg-red-950 dark:text-red-200',
	Danger: 'bg-red-600 text-white dark:bg-red-950 dark:text-red-200',
	Caution: 'bg-amber-500 text-white dark:bg-amber-950 dark:text-amber-200',
	Information: 'bg-blue-500 text-white dark:bg-blue-950 dark:text-blue-200',
}

interface AlertBadgeProps {
	parkCode?: string
	alertsOverride?: NpsAlert[] | null
}

function AlertBadgeContent({ alerts }: { alerts: NpsAlert[] }) {
	const highest = alerts.find(
		(a) => a.category === 'Park Closure' || a.category === 'Danger'
	) ?? alerts[0]

	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${categoryColor[highest.category]}`}
			aria-label={`${alerts.length} active alert${alerts.length !== 1 ? 's' : ''}: ${highest.category}`}
		>
			{alerts.length > 1 ? `${alerts.length} alerts` : highest.category}
		</span>
	)
}

export function AlertBadge({ parkCode, alertsOverride }: AlertBadgeProps) {
	const shouldFetch = alertsOverride === undefined
	const { data: alerts } = useAlerts(shouldFetch ? (parkCode ?? '') : '')

	const resolvedAlerts = alertsOverride ?? alerts
	if (!resolvedAlerts?.length) return null
	return <AlertBadgeContent alerts={resolvedAlerts} />
}
