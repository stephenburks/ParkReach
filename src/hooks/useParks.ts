import { useInfiniteQuery } from '@tanstack/react-query'
import type { NpsApiResponse } from '@/types/park'

export const PARKS_LIMIT = 24

function toApiDesignation(display: string): string {
	if (!display || display === 'All') return ''
	return display.replace(/s$/, '') // "National Parks" → "National Park"
}

async function fetchParkPage(
	q: string,
	stateCode: string,
	designation: string,
	start: number
): Promise<NpsApiResponse> {
	const params = new URLSearchParams({ limit: String(PARKS_LIMIT), start: String(start) })
	if (q) params.set('q', q)
	if (stateCode) params.set('stateCode', stateCode)
	if (designation) params.set('designation', designation)

	const res = await fetch(`/api/parks?${params}`)
	if (!res.ok) throw new Error('Failed to load parks')
	return res.json()
}

export function useParks(search: string, stateCode: string, designation: string) {
	const apiDesignation = toApiDesignation(designation)

	return useInfiniteQuery({
		queryKey: ['parks', search, stateCode, apiDesignation],
		queryFn: ({ pageParam }) =>
			fetchParkPage(search, stateCode, apiDesignation, pageParam as number),
		initialPageParam: 0,
		getNextPageParam: (lastPage, allPages) => {
			const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0)
			const total = parseInt(lastPage.total, 10)
			return loaded < total ? loaded : undefined
		},
	})
}
