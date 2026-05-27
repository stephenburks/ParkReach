'use client'

import { useAlerts } from '@/hooks/useAlerts'
import type { NpsAlert } from '@/types/alert'

const categoryColor: Record<NpsAlert['category'], string> = {
	'Park Closure': 'bg-red-600 text-white',
	Danger: 'bg-red-600 text-white',
	Caution: 'bg-amber-500 text-white',
	Information: 'bg-blue-500 text-white',
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
