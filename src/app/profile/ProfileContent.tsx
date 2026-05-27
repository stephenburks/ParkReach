'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSaves } from '@/context/SavesContext'
import { useParksByCode } from '@/hooks/useParksByCode'
import { useProfile } from '@/hooks/useProfile'
import { useTrips } from '@/hooks/useTrips'
import { AuthButton } from '@/components/AuthButton'
import { AuthModal } from '@/components/AuthModal'
import { HeaderControls } from '@/components/HeaderControls'
import Link from 'next/link'
import type { Park } from '@/types/park'
import type { Trip, TripPark } from '@/types/supabase'
import { formatStates } from '@/components/park-card-utils'
import { MapPin } from 'lucide-react'

interface ParkRowProps {
	parkCode: string
	parkByCode: Record<string, Park | undefined>
}

function ParkRow({ parkCode, parkByCode }: ParkRowProps) {
	const park = parkByCode[parkCode]
	return (
		<Link
			href={`/parks/${parkCode}`}
			className="block p-4 bg-white dark:bg-stone-800 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors border border-stone-100 dark:border-stone-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest"
		>
			<p className="font-medium text-park-bark dark:text-park-cream leading-snug">
				{park?.fullName ?? parkCode}
			</p>
			{park?.states && (
				<p className="text-xs text-park-stone dark:text-stone-400 mt-0.5">
					<MapPin className="h-3 w-3 inline mr-1" aria-hidden="true" />{formatStates(park.states)}
				</p>
			)}
			{park?.designation && (
				<p className="text-xs text-park-stone dark:text-stone-400 mt-0.5">{park.designation}</p>
			)}
		</Link>
	)
}

function Avatar({ url, name }: { url: string | null; name: string }) {
	if (url) {
		return (
			<Image
				src={url}
				alt={name}
				width={64}
				height={64}
				className="w-16 h-16 rounded-full object-cover ring-2 ring-park-forest/20"
			/>
		)
	}
	return (
		<div
			className="w-16 h-16 rounded-full bg-park-forest text-white flex items-center justify-center text-2xl font-bold ring-2 ring-park-forest/20"
			aria-hidden="true"
		>
			{name[0]?.toUpperCase() ?? '?'}
		</div>
	)
}

interface SavedParkSectionProps {
	title: string
	saves: Array<{ id: string; park_code: string }>
	parkByCode: Record<string, Park | undefined>
	emptyMessage: string
}

interface TripsSectionProps {
	trips: Trip[]
	tripParks: TripPark[]
}

function TripsSection({ trips, tripParks }: TripsSectionProps) {
	return (
		<section className="max-w-4xl mx-auto mb-12">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">Trips ({trips.length})</h2>
			</div>
			{trips.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{trips.map((trip) => {
						const count = tripParks.filter((tripPark) => tripPark.trip_id === trip.id).length
						return (
							<Link
								key={trip.id}
								href={`/trips/${trip.id}`}
								className="block p-4 bg-white dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700 shadow-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
							>
								<p className="font-medium text-park-bark dark:text-park-cream leading-snug">
									{trip.name}
								</p>
								<p className="text-xs text-park-stone dark:text-stone-400 mt-0.5">
									{count} {count === 1 ? 'park' : 'parks'}
								</p>
								{trip.description && (
									<p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-1">
										{trip.description}
									</p>
								)}
							</Link>
						)
					})}
				</div>
			) : (
				<p className="text-stone-500">No trips yet. Open a park and click &ldquo;Add to Trip&rdquo; to create one.</p>
			)}
		</section>
	)
}

function SavedParkSection({ title, saves, parkByCode, emptyMessage }: SavedParkSectionProps) {
	return (
		<section className="max-w-4xl mx-auto mb-12">
			<h2 className="text-xl font-semibold mb-4">{title} ({saves.length})</h2>
			{saves.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{saves.map((save) => (
						<ParkRow key={save.id} parkCode={save.park_code} parkByCode={parkByCode} />
					))}
				</div>
			) : (
				<p className="text-stone-500">{emptyMessage}</p>
			)}
			<Link href="/" className="inline-block mt-4 text-park-forest hover:underline">
				Explore parks
			</Link>
		</section>
	)
}

export function ProfileContent() {
	const { user, loading: authLoading } = useAuth()
	const { profile, loading: profileLoading } = useProfile()
	const { saves, loading: savesLoading } = useSaves()
	const { trips, tripParks, loading: tripsLoading } = useTrips()
	const [showAuthModal, setShowAuthModal] = useState(false)

	const allCodes = useMemo(() => saves.map((save) => save.park_code), [saves])
	const { data: parks = [] } = useParksByCode(allCodes)

	const parkByCode = useMemo(
		() => Object.fromEntries(parks.map((park) => [park.parkCode, park])),
		[parks]
	)

	if (authLoading || profileLoading || savesLoading || tripsLoading) {
		return (
			<div className="min-h-screen bg-park-cream dark:bg-park-bark p-8">
				<div className="max-w-4xl mx-auto">
					<div className="animate-pulse space-y-4">
						<div className="flex items-center gap-4 mb-8">
							<div className="w-16 h-16 rounded-full bg-stone-200 dark:bg-stone-700" />
							<div className="space-y-2">
								<div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-40" />
								<div className="h-4 bg-stone-100 dark:bg-stone-600 rounded w-28" />
							</div>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{Array.from({ length: 6 }).map((_value, index) => (
								<div key={index} className="bg-white dark:bg-stone-800 rounded-xl h-24" />
							))}
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className="min-h-screen bg-park-cream dark:bg-park-bark flex flex-col items-center justify-center p-4">
				<div className="text-center max-w-md">
					<h1 className="text-2xl font-semibold mb-2">Sign in to view your profile</h1>
					<p className="text-stone-500 mb-6">Save parks and track visits by signing in</p>
					<AuthButton onSignInClick={() => setShowAuthModal(true)} />
				</div>
				<AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
			</div>
		)
	}

	const displayName = profile?.display_name ?? user.email ?? 'Traveler'
	const wishlisted = saves.filter((save) => save.wishlisted)
	const visited = saves.filter((save) => save.visited)

  return (
    <div className="min-h-screen bg-park-cream dark:bg-park-bark p-8">
      <header className="max-w-4xl mx-auto mb-6 flex items-center justify-between">
        <Link href="/" className="text-park-forest hover:underline text-sm font-medium">
          ← Back to Parks
        </Link>
        <HeaderControls />
      </header>
      <main id="main-content" className="max-w-4xl mx-auto">
        <div className="max-w-4xl mx-auto mb-10 flex items-center gap-5">
          <Avatar url={profile?.avatar_url ?? null} name={displayName} />
          <div>
            <h1 className="text-3xl font-bold text-park-bark dark:text-park-cream">{displayName}</h1>
            {profile?.display_name && (
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{user.email}</p>
            )}
          </div>
        </div>

        <TripsSection trips={trips} tripParks={tripParks} />

        <SavedParkSection
          title="Wishlist"
          saves={wishlisted}
          parkByCode={parkByCode}
          emptyMessage="No wishlisted parks yet."
        />

        <SavedParkSection
          title="Visited"
          saves={visited}
          parkByCode={parkByCode}
          emptyMessage="No visited parks yet."
        />
      </main>
    </div>
  )
}
