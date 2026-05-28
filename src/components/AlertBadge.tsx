'use client'

import { useAlerts } from '@/hooks/useAlerts'
import type { NpsAlert } from '@/types/alert'

const categoryColor: Record<NpsAlert['category'], string> = {
	'Park Closure': 'bg-red-600 text-white dark:bg-red-950 dark:text-red-200',
	Danger: 'bg-red-600 text-white dark:bg-red-950 dark:text-red-200',
	Caution: 'bg-amber-700 text-white dark:bg-amber-950 dark:text-amber-200',
	Information: 'bg-blue-600 text-white dark:bg-blue-950 dark:text-blue-200',
}

interface AlertSummaryProps {
	alert_count?: number
	has_closure?: boolean
	has_danger?: boolean
	alert_level?: string | null
}

interface AlertBadgeProps {
	parkCode?: string
	alertsOverride?: NpsAlert[] | null
	alertSummary?: AlertSummaryProps
}

function AlertBadgeContent({ alerts }: { alerts: NpsAlert[] }) {
	const highest = alerts.find(
		(a) => a.category === 'Park Closure' || a.category === 'Danger'
	) ?? alerts[0]

	return (
		<span
			className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${categoryColor[highest.category]}`}
		>
			<span className="sr-only">{alerts.length} active alert{alerts.length !== 1 ? 's' : ''}: </span>
			{alerts.length > 1 ? `${alerts.length} alerts` : highest.category}
		</span>
	)
}

function AlertSummaryBadge({ summary }: { summary: AlertSummaryProps }) {
	const { has_closure, has_danger, alert_count } = summary

	if (has_closure) {
		return (
			<span
				className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${categoryColor['Park Closure']}`}
			>
				<span className="sr-only">Park Closure alert: </span>
				Closures
			</span>
		)
	}

	if (has_danger) {
		return (
			<span
				className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${categoryColor.Danger}`}
			>
				<span className="sr-only">Danger alert: </span>
				Danger Alert
			</span>
		)
	}

	if (alert_count && alert_count > 0) {
		const count = alert_count
		return (
			<span
				className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${categoryColor[count > 1 ? 'Caution' : 'Information']}`}
			>
				<span className="sr-only">{count} active alert{count !== 1 ? 's' : ''}: </span>
				{count} alert{count !== 1 ? 's' : ''}
			</span>
		)
	}

	return null
}

export function AlertBadge({ parkCode, alertsOverride, alertSummary }: AlertBadgeProps) {
	const shouldFetch = !alertSummary && alertsOverride === undefined
	const { data: alerts } = useAlerts(shouldFetch ? (parkCode ?? '') : '')

	if (alertSummary) {
		return <AlertSummaryBadge summary={alertSummary} />
	}

	const resolvedAlerts = alertsOverride ?? alerts
	if (!resolvedAlerts?.length) return null
	return <AlertBadgeContent alerts={resolvedAlerts} />
}
