'use client'

import { useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTrips } from '@/hooks/useTrips'
import type { Trip } from '@/types/supabase'

interface Props {
	parkCode: string
}

interface TripListItemProps {
	trip: Trip
	inTrip: boolean
	onToggle: (tripId: string) => void
}

function TripListItem({ trip, inTrip, onToggle }: TripListItemProps) {
	return (
		<li>
			<button
				onClick={() => onToggle(trip.id)}
				className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-park-forest"
				aria-pressed={inTrip}
			>
				<span
					className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 text-xs ${
						inTrip
							? 'bg-park-forest border-park-forest text-white'
							: 'border-stone-300 dark:border-stone-500'
					}`}
					aria-hidden="true"
				>
					{inTrip ? '✓' : ''}
				</span>
				<span className="text-park-bark dark:text-park-cream">{trip.name}</span>
			</button>
		</li>
	)
}

interface NewTripFormProps {
	onCreated: (name: string) => Promise<void>
	onCancel: () => void
}

function NewTripForm({ onCreated, onCancel }: NewTripFormProps) {
	const [name, setName] = useState('')
	const [creating, setCreating] = useState(false)

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		const trimmed = name.trim()
		if (!trimmed) return
		setCreating(true)
		await onCreated(trimmed)
		setCreating(false)
		setName('')
	}

	return (
		<form onSubmit={handleSubmit} className="flex gap-2">
			<label htmlFor="new-trip-name" className="sr-only">New trip name</label>
			<input
				id="new-trip-name"
				type="text"
				value={name}
				onChange={(event) => setName(event.target.value)}
				placeholder="Trip name"
				autoFocus
				className="flex-1 min-w-0 text-sm px-3 py-1.5 border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-700 text-park-bark dark:text-park-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-park-forest/50"
				required
			/>
			<button
				type="submit"
				disabled={creating || !name.trim()}
				className="px-3 py-1.5 bg-park-forest text-white text-xs font-semibold rounded-lg disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest focus-visible:ring-offset-1"
			>
				{creating ? '…' : 'Create'}
			</button>
			<button
				type="button"
				onClick={onCancel}
				className="px-3 py-1.5 text-stone-500 text-xs rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
			>
				Cancel
			</button>
		</form>
	)
}

export function AddToTripButton({ parkCode }: Props) {
	const { user } = useAuth()
	const { trips, tripParks, loading, createTrip, addParkToTrip, removeParkFromTrip } = useTrips()
	const [expanded, setExpanded] = useState(false)
	const [showNewForm, setShowNewForm] = useState(false)
	const newTripButtonRef = useRef<HTMLButtonElement>(null)

	if (!user) return null

	const tripIdsWithPark = new Set(
		tripParks.filter((tripPark) => tripPark.park_code === parkCode).map((tripPark) => tripPark.trip_id),
	)

	const handleToggle = async (tripId: string) => {
		if (tripIdsWithPark.has(tripId)) {
			await removeParkFromTrip(tripId, parkCode)
		} else {
			await addParkToTrip(tripId, parkCode)
		}
	}

	const handleExpandToggle = () => {
		setExpanded((prev) => {
			if (!prev) setShowNewForm(false)
			return !prev
		})
	}

	const handleCreated = async (name: string) => {
		const trip = await createTrip(name)
		if (trip) {
			await addParkToTrip(trip.id, parkCode)
			setShowNewForm(false)
		}
	}

	const inCount = tripIdsWithPark.size

	return (
		<div className="w-full">
			<button
				onClick={handleExpandToggle}
				aria-expanded={expanded}
				className="flex items-center gap-2 px-5 py-2.5 bg-park-cream dark:bg-stone-700 border border-stone-200 dark:border-stone-600 text-park-bark dark:text-park-cream font-semibold rounded-full text-sm transition-colors hover:bg-stone-100 dark:hover:bg-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest focus-visible:ring-offset-2"
			>
				<span aria-hidden="true">🗺️</span>
				{inCount > 0 ? `In ${inCount} trip${inCount > 1 ? 's' : ''}` : 'Add to Trip'}
				<span className="ml-auto text-xs opacity-60" aria-hidden="true">{expanded ? '▲' : '▼'}</span>
			</button>

			{expanded && (
				<div className="mt-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 overflow-hidden shadow-sm">
					{loading ? (
						<p className="px-4 py-3 text-sm text-stone-500">Loading trips…</p>
					) : trips.length === 0 && !showNewForm ? (
						<p className="px-4 py-3 text-sm text-stone-500">No trips yet.</p>
					) : (
						<ul role="list" className="divide-y divide-stone-100 dark:divide-stone-700 max-h-48 overflow-y-auto">
							{trips.map((trip) => (
								<TripListItem
									key={trip.id}
									trip={trip}
									inTrip={tripIdsWithPark.has(trip.id)}
									onToggle={handleToggle}
								/>
							))}
						</ul>
					)}

					<div className="px-4 py-3 border-t border-stone-100 dark:border-stone-700">
						{showNewForm ? (
							<NewTripForm onCreated={handleCreated} onCancel={() => setShowNewForm(false)} />
						) : (
							<button
								ref={newTripButtonRef}
								onClick={() => setShowNewForm(true)}
								className="text-sm text-park-forest hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest rounded"
							>
								+ New trip
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
