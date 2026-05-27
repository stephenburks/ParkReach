/// <reference types="vitest/globals" />
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useTrips } from '@/hooks/useTrips'
import type { Trip, TripPark } from '@/types/supabase'

// Mock the AuthContext module
const mockUseAuth = vi.fn()
vi.mock('@/context/AuthContext', () => ({
	useAuth: () => mockUseAuth(),
}))

function createChain(data: unknown = null) {
	const chain: Record<string, unknown> = { data, error: null }
	chain.select = vi.fn().mockReturnValue(chain)
	chain.eq = vi.fn().mockReturnValue(chain)
	chain.order = vi.fn().mockReturnValue(chain)
	chain.in = vi.fn().mockReturnValue(chain)
	chain.single = vi.fn().mockReturnValue(chain)
	chain.insert = vi.fn().mockReturnValue(chain)
	chain.delete = vi.fn().mockReturnValue(chain)
	chain.update = vi.fn().mockReturnValue(chain)
	return chain
}

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	})
	function TestWrapper({ children }: { children: React.ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	}
	return TestWrapper
}

function makeTrip(overrides: Partial<Trip> = {}): Trip {
	return {
		id: 'trip-1',
		user_id: 'user-1',
		name: 'Summer Road Trip',
		description: 'A fun trip',
		created_at: '2024-01-01T00:00:00Z',
		...overrides,
	}
}

function makeTripPark(overrides: Partial<TripPark> = {}): TripPark {
	return {
		id: 'tp-1',
		trip_id: 'trip-1',
		park_code: 'yose',
		notes: null,
		added_at: '2024-01-02T00:00:00Z',
		...overrides,
	}
}

describe('useTrips', () => {
	beforeEach(() => {
		vi.resetAllMocks()
	})

	it('returns trips when data loads', async () => {
		const trip = makeTrip()
		const tripPark = makeTripPark()
		const mockSupabase = {
			from: vi.fn().mockImplementation((table: string) => {
				if (table === 'trips') return createChain([trip])
				if (table === 'trip_parks') return createChain([tripPark])
				return createChain(null)
			}),
		}

		mockUseAuth.mockReturnValue({
			supabase: mockSupabase,
			user: { id: 'user-1' },
		})

		const { result } = renderHook(() => useTrips(), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.trips).toHaveLength(1)
		expect(result.current.trips[0].name).toBe('Summer Road Trip')
		expect(result.current.tripParks).toHaveLength(1)
		expect(result.current.tripParks[0].park_code).toBe('yose')
	})

	it('returns empty arrays when user is not authenticated', async () => {
		mockUseAuth.mockReturnValue({
			supabase: null,
			user: null,
		})

		const { result } = renderHook(() => useTrips(), {
			wrapper: createWrapper(),
		})

		// Query is disabled when no user, so loading should resolve to false
		await waitFor(() => {
			expect(result.current.loading).toBe(false)
		})

		expect(result.current.trips).toEqual([])
		expect(result.current.tripParks).toEqual([])
	})

	it('handles loading state', () => {
		mockUseAuth.mockReturnValue({
			supabase: null,
			user: { id: 'user-1' },
		})

		const { result } = renderHook(() => useTrips(), {
			wrapper: createWrapper(),
		})

		// When supabase is null but user exists, query is disabled
		// loading should be false (not loading since query is disabled)
		expect(result.current.loading).toBe(false)
	})
})
