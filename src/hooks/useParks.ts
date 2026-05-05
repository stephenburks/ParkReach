import { useInfiniteQuery } from '@tanstack/react-query'
import type { NpsApiResponse } from '@/types/park'

const PARKS_LIMIT = 24

// NPS API does not support filtering by designation — convert display label
// to singular form for client-side comparison only.
function toApiDesignation(display: string): string {
	if (!display || display === 'All') return ''
	return display.replace(/s$/, '') // "National Parks" → "National Park"
}

async function fetchParksApi(params: URLSearchParams): Promise<NpsApiResponse> {
	const res = await fetch(`/api/parks?${params}`)
	if (!res.ok) throw new Error('Failed to load parks')
	return res.json()
}

async function fetchParkPage(
	q: string,
	stateCode: string,
	designation: string,
	start: number
): Promise<NpsApiResponse> {
	if (designation) {
		// NPS API ignores the designation param, so fetch a large batch and filter
		// client-side. Individual designation types have at most ~70 parks.
		const params = new URLSearchParams({ limit: '500', start: '0' })
		if (q) params.set('q', q)
		if (stateCode) params.set('stateCode', stateCode)

		const data = await fetchParksApi(params)
		const filtered = data.data.filter(
			(park) => park.designation?.toLowerCase() === designation.toLowerCase()
		)
		return { ...data, data: filtered, total: String(filtered.length) }
	}

	const params = new URLSearchParams({ limit: String(PARKS_LIMIT), start: String(start) })
	if (q) params.set('q', q)
	if (stateCode) params.set('stateCode', stateCode)

	return fetchParksApi(params)
}

export function useParks(search: string, stateCode: string, designation: string) {
	const apiDesignation = toApiDesignation(designation)

	return useInfiniteQuery({
		queryKey: ['parks', search, stateCode, apiDesignation],
		queryFn: ({ pageParam }) =>
			fetchParkPage(search, stateCode, apiDesignation, pageParam as number),
		initialPageParam: 0,
		staleTime: 24 * 60 * 60 * 1000,
		getNextPageParam: (lastPage, allPages) => {
			// When designation is filtered, all results come back as a single page
			if (apiDesignation) return undefined
			const loaded = allPages.reduce((total, page) => total + page.data.length, 0)
			const total = parseInt(lastPage.total, 10)
			return loaded < total ? loaded : undefined
		},
	})
}
