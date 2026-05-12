'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import type { Trip, TripPark } from '@/types/supabase'

export function useTrips() {
	const { supabase, user } = useAuth()
	const queryClient = useQueryClient()

	const { data, isLoading: loading } = useQuery({
		queryKey: ['trips', user?.id],
		queryFn: async () => {
			if (!supabase || !user) return { trips: [], tripParks: [] }

			const { data: tripsData } = await supabase
				.from('trips')
				.select('*')
				.eq('user_id', user.id)
				.order('created_at', { ascending: false })

			const fetchedTrips: Trip[] = tripsData ?? []

			let fetchedTripParks: TripPark[] = []
			if (fetchedTrips.length > 0) {
				const { data: parksData } = await supabase
					.from('trip_parks')
					.select('*')
					.in('trip_id', fetchedTrips.map((trip) => trip.id))
				fetchedTripParks = parksData ?? []
			}

			return { trips: fetchedTrips, tripParks: fetchedTripParks }
		},
		enabled: !!(supabase && user),
	})

	const trips = data?.trips ?? []
	const tripParks = data?.tripParks ?? []

	const createTripMutation = useMutation({
		mutationFn: async ({ name, description }: { name: string; description?: string }) => {
			if (!supabase || !user) return null
			const { data, error } = await supabase
				.from('trips')
				.insert({ user_id: user.id, name, description: description ?? null })
				.select()
				.single()
			return error ? null : data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['trips', user?.id] })
		},
	})

	const deleteTripMutation = useMutation({
		mutationFn: async (id: string) => {
			if (!supabase) return false
			const { error } = await supabase.from('trips').delete().eq('id', id)
			return !error
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['trips', user?.id] })
		},
	})

	const addParkToTripMutation = useMutation({
		mutationFn: async ({ tripId, parkCode }: { tripId: string; parkCode: string }) => {
			if (!supabase) return false
			const { error } = await supabase
				.from('trip_parks')
				.insert({ trip_id: tripId, park_code: parkCode })
				.select()
				.single()
			return !error
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['trips', user?.id] })
		},
	})

	const removeParkFromTripMutation = useMutation({
		mutationFn: async ({ tripId, parkCode }: { tripId: string; parkCode: string }) => {
			if (!supabase) return false
			const { error } = await supabase
				.from('trip_parks')
				.delete()
				.eq('trip_id', tripId)
				.eq('park_code', parkCode)
			return !error
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['trips', user?.id] })
		},
	})

	const updateTripMutation = useMutation({
		mutationFn: async ({ id, updates }: { id: string; updates: { name?: string; description?: string | null } }) => {
			if (!supabase) return false
			const { error } = await supabase
				.from('trips')
				.update(updates)
				.eq('id', id)
				.select()
				.single()
			return !error
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['trips', user?.id] })
		},
	})

	async function createTrip(name: string, description?: string): Promise<Trip | null> {
		return createTripMutation.mutateAsync({ name, description })
	}

	async function deleteTrip(id: string): Promise<boolean> {
		return deleteTripMutation.mutateAsync(id)
	}

	async function addParkToTrip(tripId: string, parkCode: string): Promise<boolean> {
		return addParkToTripMutation.mutateAsync({ tripId, parkCode })
	}

	async function removeParkFromTrip(tripId: string, parkCode: string): Promise<boolean> {
		return removeParkFromTripMutation.mutateAsync({ tripId, parkCode })
	}

	async function updateTrip(id: string, updates: { name?: string; description?: string | null }): Promise<boolean> {
		return updateTripMutation.mutateAsync({ id, updates })
	}

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