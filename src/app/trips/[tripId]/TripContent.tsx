'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useTrips } from '@/hooks/useTrips'
import { useParksByCode } from '@/hooks/useParksByCode'
import type { Park } from '@/types/park'

interface Props {
	tripId: string
}

function ParkRow({
	park,
	parkCode,
	onRemove,
}: {
	park: Park | undefined
	parkCode: string
	onRemove: () => void
}) {
	return (
		<div className="flex items-center justify-between p-4 bg-white dark:bg-stone-800 rounded-lg group">
			<Link
				href={`/parks/${parkCode}`}
				className="flex-1 min-w-0 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest rounded"
			>
				<p className="font-medium text-park-bark dark:text-park-cream leading-snug truncate">
					{park?.fullName ?? parkCode}
				</p>
				{park?.designation && (
					<p className="text-xs text-park-stone dark:text-stone-400 mt-0.5">{park.designation}</p>
				)}
			</Link>
			<button
				onClick={onRemove}
				className="ml-4 text-xs text-stone-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded px-2 py-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
				aria-label={`Remove ${park?.fullName ?? parkCode} from trip`}
			>
				Remove
			</button>
		</div>
	)
}

export function TripContent({ tripId }: Props) {
	const { trips, tripParks, loading, deleteTrip, removeParkFromTrip, updateTrip } = useTrips()
	const [editing, setEditing] = useState(false)
	const [editName, setEditName] = useState('')
	const [saving, setSaving] = useState(false)
	const [deleting, setDeleting] = useState(false)

	const trip = trips.find((trip) => trip.id === tripId)
	const parks = useMemo(
		() => tripParks.filter((tripPark) => tripPark.trip_id === tripId),
		[tripParks, tripId],
	)
	const parkCodes = useMemo(() => parks.map((tripPark) => tripPark.park_code), [parks])
	const { data: parkDetails = [] } = useParksByCode(parkCodes)
	const parkByCode = useMemo(
		() => Object.fromEntries(parkDetails.map((park) => [park.parkCode, park])),
		[parkDetails],
	)

	if (loading) {
		return (
			<div className="animate-pulse space-y-4 max-w-2xl mx-auto py-8">
				<div className="h-8 bg-stone-200 dark:bg-stone-700 rounded w-48" />
				<div className="space-y-3">
					{Array.from({ length: 4 }).map((_value, index) => (
						<div key={index} className="h-16 bg-white dark:bg-stone-800 rounded-lg" />
					))}
				</div>
			</div>
		)
	}

	if (!trip) {
		return (
			<div className="text-center py-16">
				<p className="text-5xl mb-4" aria-hidden="true">🗺️</p>
				<p className="text-park-bark dark:text-park-cream font-semibold text-lg mb-2">Trip not found</p>
				<Link href="/profile" className="text-park-forest hover:underline text-sm">
					Back to profile
				</Link>
			</div>
		)
	}

	const handleSaveName = async (event: React.FormEvent) => {
		event.preventDefault()
		if (!editName.trim()) return
		setSaving(true)
		await updateTrip(tripId, { name: editName.trim() })
		setSaving(false)
		setEditing(false)
	}

	const handleDelete = async () => {
		if (!confirm(`Delete "${trip.name}"? This cannot be undone.`)) return
		setDeleting(true)
		await deleteTrip(tripId)
		window.location.href = '/profile'
	}

	return (
		<div className="min-h-screen bg-park-cream dark:bg-park-bark p-8">
			<div className="max-w-2xl mx-auto">
				<nav className="mb-6">
					<Link href="/profile" className="text-sm text-park-forest hover:underline">
						← My Profile
					</Link>
				</nav>

				<header className="mb-8">
					{editing ? (
						<form onSubmit={handleSaveName} className="flex items-center gap-3">
							<label htmlFor="trip-name-edit" className="sr-only">Trip name</label>
							<input
								id="trip-name-edit"
								type="text"
								value={editName}
								onChange={(event) => setEditName(event.target.value)}
								autoFocus
								className="flex-1 text-2xl font-bold bg-transparent border-b-2 border-park-forest text-park-bark dark:text-park-cream focus:outline-none"
								required
							/>
							<button
								type="submit"
								disabled={saving}
								className="px-3 py-1.5 bg-park-forest text-white text-sm font-semibold rounded-lg disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest"
							>
								{saving ? '…' : 'Save'}
							</button>
							<button
								type="button"
								onClick={() => setEditing(false)}
								className="px-3 py-1.5 text-stone-500 text-sm rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
							>
								Cancel
							</button>
						</form>
					) : (
						<div className="flex items-start justify-between gap-4">
							<div>
								<h1 className="text-3xl font-bold text-park-bark dark:text-park-cream">{trip.name}</h1>
								{trip.description && (
									<p className="text-stone-500 dark:text-stone-400 mt-1">{trip.description}</p>
								)}
								<p className="text-xs text-stone-400 dark:text-stone-500 mt-2">
									{parks.length} {parks.length === 1 ? 'park' : 'parks'}
								</p>
							</div>
							<div className="flex items-center gap-2 flex-shrink-0">
								<button
									onClick={() => { setEditName(trip.name); setEditing(true) }}
									className="text-xs text-stone-500 hover:text-park-bark dark:hover:text-park-cream transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded px-2 py-1"
								>
									Rename
								</button>
								<button
									onClick={handleDelete}
									disabled={deleting}
									className="text-xs text-stone-400 hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded px-2 py-1 disabled:opacity-60"
								>
									{deleting ? '…' : 'Delete trip'}
								</button>
							</div>
						</div>
					)}
				</header>

				{parks.length > 0 ? (
					<ul role="list" className="space-y-3">
						{parks.map((tripPark) => (
							<li key={tripPark.id}>
								<ParkRow
									park={parkByCode[tripPark.park_code]}
									parkCode={tripPark.park_code}
									onRemove={() => removeParkFromTrip(tripId, tripPark.park_code)}
								/>
							</li>
						))}
					</ul>
				) : (
					<div className="text-center py-12">
						<p className="text-stone-500 mb-4">No parks in this trip yet.</p>
						<Link
							href="/"
							className="inline-block px-6 py-2.5 bg-park-forest text-white font-semibold rounded-full text-sm hover:bg-park-bark transition-colors"
						>
							Explore parks
						</Link>
					</div>
				)}
			</div>
		</div>
	)
}
