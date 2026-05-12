import { useQuery } from '@tanstack/react-query'
import type { NpsApiResponse, Park } from '@/types/park'

const PREVIEW_LIMIT = 24
const FULL_LIMIT = 600

function toApiDesignation(display: string): string {
	if (!display || display === 'All') return ''
	return display.replace(/s$/, '')
}

async function fetchParksApi(params: URLSearchParams): Promise<NpsApiResponse> {
	const res = await fetch(`/api/parks?${params}`)
	if (!res.ok) throw new Error('Failed to load parks')
	return res.json()
}

function buildParams(q: string, stateCode: string, limit: number): URLSearchParams {
	const params = new URLSearchParams({ limit: String(limit), start: '0' })
	if (q) params.set('q', q)
	if (stateCode) params.set('stateCode', stateCode)
	return params
}

function filterByDesignation(parks: Park[], designation: string): Park[] {
	if (!designation) return parks
	return parks.filter(
		(park) => park.designation?.toLowerCase() === designation.toLowerCase()
	)
}

export function useParks(search: string, stateCode: string, designation: string) {
	const apiDesignation = toApiDesignation(designation)

	const previewQuery = useQuery({
		queryKey: ['parks', 'preview', search, stateCode, apiDesignation],
		queryFn: async () => {
			if (apiDesignation) {
				const data = await fetchParksApi(buildParams(search, stateCode, FULL_LIMIT))
				const filtered = filterByDesignation(data.data, apiDesignation)
				return { ...data, data: filtered, total: String(filtered.length) }
			}
			return fetchParksApi(buildParams(search, stateCode, PREVIEW_LIMIT))
		},
		staleTime: 24 * 60 * 60 * 1000,
	})

	const needsFullLoad = !apiDesignation

	const fullQuery = useQuery({
		queryKey: ['parks', 'full', search, stateCode, apiDesignation],
		queryFn: () => fetchParksApi(buildParams(search, stateCode, FULL_LIMIT)),
		enabled: needsFullLoad && previewQuery.isSuccess,
		staleTime: 24 * 60 * 60 * 1000,
	})

	const activeData = fullQuery.data ?? previewQuery.data
	const parks = activeData?.data ?? []
	const total = parseInt(activeData?.total ?? '0', 10)

	const isLoading = previewQuery.isLoading
	const isBackgroundLoading = needsFullLoad && previewQuery.isSuccess && fullQuery.isFetching
	const error = previewQuery.error ?? fullQuery.error
	const isRefetching = previewQuery.isFetching && !previewQuery.isLoading

	return { parks, total, isLoading, isBackgroundLoading, error, isRefetching }
}
