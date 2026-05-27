/// <reference types="vitest/globals" />
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useParks } from '@/hooks/useParks'
import type { Park, NpsApiResponse } from '@/types/park'

const mockFetch = vi.fn()
globalThis.fetch = mockFetch

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	})
	function TestWrapper({ children }: { children: React.ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	}
	return TestWrapper
}

function makePark(overrides: Partial<Park> = {}): Park {
	return {
		id: '1',
		name: 'Yosemite',
		fullName: 'Yosemite National Park',
		parkCode: 'yose',
		description: 'A beautiful park in California',
		designation: 'National Park',
		states: 'CA',
		url: 'https://www.nps.gov/yose',
		latitude: '37.8651',
		longitude: '-119.5383',
		activities: [],
		topics: [],
		entranceFees: [],
		entrancePasses: [],
		operatingHours: [],
		images: [],
		weatherInfo: '',
		directionsInfo: '',
		directionsUrl: '',
		...overrides,
	}
}

function npsResponse(parks: Park[], total?: number): NpsApiResponse {
	return {
		total: String(total ?? parks.length),
		limit: '24',
		start: '0',
		data: parks,
	}
}

describe('useParks', () => {
	beforeEach(() => {
		mockFetch.mockReset()
	})

	it('returns parks data when API succeeds', async () => {
		const park = makePark()
		// Preview query (limit=24) — called first
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => npsResponse([park]),
		})
		// Full query (limit=600) — enabled after preview succeeds
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => npsResponse([park]),
		})

		const { result } = renderHook(() => useParks('', '', 'All'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		})

		expect(result.current.parks).toHaveLength(1)
		expect(result.current.parks[0].parkCode).toBe('yose')
		expect(result.current.total).toBe(1)
	})

	it('filters by designation (exact match after normalization)', async () => {
		const nationalPark = makePark({ parkCode: 'yose', designation: 'National Park' })
		const nationalMonument = makePark({
			parkCode: 'grca',
			name: 'Grand Canyon',
			designation: 'National Monument',
		})

		// When designation is set, only one fetch (FULL_LIMIT, then client-side filter)
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => npsResponse([nationalPark, nationalMonument], 2),
		})

		const { result } = renderHook(() => useParks('', '', 'National Park'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		})

		expect(result.current.parks).toHaveLength(1)
		expect(result.current.parks[0].parkCode).toBe('yose')
	})

	it('filters by designation with plural input (strips trailing s)', async () => {
		const nationalPark = makePark({ parkCode: 'yose', designation: 'National Park' })
		const nationalHistoric = makePark({
			parkCode: 'frst',
			name: 'First State',
			designation: 'National Historical Park',
		})

		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => npsResponse([nationalPark, nationalHistoric], 2),
		})

		const { result } = renderHook(() => useParks('', '', 'National Parks'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		})

		expect(result.current.parks).toHaveLength(1)
		expect(result.current.parks[0].parkCode).toBe('yose')
	})

	it('returns empty array when API fails', async () => {
		mockFetch.mockRejectedValueOnce(new Error('Network error'))

		const { result } = renderHook(() => useParks('', '', 'All'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.error).toBeTruthy()
		})

		expect(result.current.parks).toEqual([])
		expect(result.current.total).toBe(0)
	})

	it('handles empty search/state/designation gracefully', async () => {
		// Preview query returns empty
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => npsResponse([]),
		})
		// Full query returns empty
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => npsResponse([]),
		})

		const { result } = renderHook(() => useParks('', '', 'All'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		})

		expect(result.current.parks).toEqual([])
		expect(result.current.total).toBe(0)
	})
})
