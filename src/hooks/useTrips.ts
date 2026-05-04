'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { Trip, TripPark } from '@/types/supabase'

export function useTrips() {
	const { supabase, user } = useAuth()
	const [trips, setTrips] = useState<Trip[]>([])
	const [tripParks, setTripParks] = useState<TripPark[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!supabase || !user) {
			setTrips([])
			setTripParks([])
			setLoading(false)
			return
		}

		const fetchAll = async () => {
			setLoading(true)
			const { data: tripsData } = await supabase
				.from('trips')
				.select('*')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false })

			const fetchedTrips = tripsData ?? []
			setTrips(fetchedTrips)

			if (fetchedTrips.length > 0) {
				const { data: parksData } = await supabase
					.from('trip_parks')
					.select('*')
					.in('trip_id', fetchedTrips.map((trip) => trip.id))
				setTripParks(parksData ?? [])
			} else {
				setTripParks([])
			}
			setLoading(false)
		}

		fetchAll()
	}, [supabase, user])

	const createTrip = useCallback(
		async (name: string, description?: string): Promise<Trip | null> => {
			if (!supabase || !user) return null
			const { data, error } = await supabase
				.from('trips')
				.insert({ user_id: user.id, name, description: description ?? null })
				.select()
				.single()
			if (!error && data) setTrips((prev) => [data, ...prev])
			return error ? null : data
		},
		[supabase, user],
	)

	const deleteTrip = useCallback(
		async (id: string): Promise<boolean> => {
			if (!supabase) return false
			const { error } = await supabase.from('trips').delete().eq('id', id)
			if (!error) {
				setTrips((prev) => prev.filter((trip) => trip.id !== id))
				setTripParks((prev) => prev.filter((tripPark) => tripPark.trip_id !== id))
			}
			return !error
		},
		[supabase],
	)

	const addParkToTrip = useCallback(
		async (tripId: string, parkCode: string): Promise<boolean> => {
			if (!supabase) return false
			const { data, error } = await supabase
				.from('trip_parks')
				.insert({ trip_id: tripId, park_code: parkCode })
				.select()
				.single()
			if (!error && data) setTripParks((prev) => [...prev, data])
			return !error
		},
		[supabase],
	)

	const removeParkFromTrip = useCallback(
		async (tripId: string, parkCode: string): Promise<boolean> => {
			if (!supabase) return false
			const { error } = await supabase
				.from('trip_parks')
				.delete()
				.eq('trip_id', tripId)
				.eq('park_code', parkCode)
			if (!error) {
				setTripParks((prev) =>
					prev.filter((tripPark) => !(tripPark.trip_id === tripId && tripPark.park_code === parkCode)),
				)
			}
			return !error
		},
		[supabase],
	)

	const updateTrip = useCallback(
		async (id: string, updates: { name?: string; description?: string | null }): Promise<boolean> => {
			if (!supabase) return false
			const { data, error } = await supabase
				.from('trips')
				.update(updates)
				.eq('id', id)
				.select()
				.single()
			if (!error && data) setTrips((prev) => prev.map((trip) => (trip.id === id ? data : trip)))
			return !error
		},
		[supabase],
	)

	return {
		trips,
		tripParks,
		loading,
		createTrip,
		deleteTrip,
		addParkToTrip,
		removeParkFromTrip,
		updateTrip,
	}
}
