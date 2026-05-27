'use client'

import { useState, useRef } from 'react'
import { X } from 'lucide-react'
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
	const [dismissed, setDismissed] = useState<Set<string>>(new Set())
	const sectionRef = useRef<HTMLElement>(null)

	const dismissAlert = (alertId: string) => {
		setDismissed((prev) => {
			const next = new Set([...prev, alertId])
			// After state settles, focus the next alert or the section itself
			requestAnimationFrame(() => {
				const nextAlert = sectionRef.current?.querySelector('[role="alert"]')
				if (nextAlert instanceof HTMLElement) {
					;(nextAlert.querySelector('button') as HTMLElement)?.focus()
				} else {
					sectionRef.current?.focus()
				}
			})
			return next
		})
	}

	const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id))
	if (visibleAlerts.length === 0) return null

	return (
		<section aria-label="Park alerts" className="space-y-2 py-4" ref={sectionRef} tabIndex={-1}>
			{visibleAlerts.map((alert) => (
				<div
					key={alert.id}
					role="alert"
					className={`rounded-lg border-l-4 p-4 relative ${bannerStyle[alert.category]}`}
				>
					<button
						onClick={() => dismissAlert(alert.id)}
						className="absolute top-3 right-3 rounded-full p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
						aria-label={`Dismiss alert: ${alert.title}`}
					>
						<X className="h-4 w-4" />
					</button>
					<p className="font-semibold pr-7">{alert.title}</p>
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
