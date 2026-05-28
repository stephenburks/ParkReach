import { useQuery } from '@tanstack/react-query'
import type { NpsApiResponse, Park } from '@/types/park'
import type { A11yFilters } from '@/components/SearchFilter'

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

function buildParams(
	q: string,
	stateCode: string,
	limit: number,
	a11yFilters: A11yFilters,
): URLSearchParams {
	const params = new URLSearchParams({ limit: String(limit), start: '0' })
	if (q) params.set('q', q)
	if (stateCode) params.set('stateCode', stateCode)
	if (a11yFilters.hasWheelchair) params.set('hasWheelchair', 'true')
	if (a11yFilters.hasBraille) params.set('hasBraille', 'true')
	if (a11yFilters.hasAsl) params.set('hasAsl', 'true')
	if (a11yFilters.hasAudioDescription) params.set('hasAudioDescription', 'true')
	return params
}

function normalizeDesignation(str: string): string {
	return str.toLowerCase().replace(/\s+/g, ' ').trim()
}

function filterByDesignation(parks: Park[], designation: string): Park[] {
	if (!designation || designation === 'All') return parks
	const normalized = normalizeDesignation(designation).replace(/s$/, '')
	return parks.filter((park) => {
		const parkDesignation = normalizeDesignation(park.designation ?? '')
		return parkDesignation === normalized
	})
}

function buildDesignationList(parks: Park[]): string[] {
	const raw = parks
		.map((p) => p.designation)
		.filter((d): d is string => Boolean(d) && d.trim() !== '')
	const unique = Array.from(new Set(raw)).sort()
	return ['All', ...unique]
}

export function useParks(
	search: string,
	stateCode: string,
	designation: string,
	a11yFilters: A11yFilters = { hasWheelchair: false, hasBraille: false, hasAsl: false, hasAudioDescription: false },
) {
	const apiDesignation = toApiDesignation(designation)

	const previewQuery = useQuery({
		queryKey: ['parks', 'preview', search, stateCode, apiDesignation, a11yFilters],
		queryFn: async () => {
			if (apiDesignation) {
				const data = await fetchParksApi(buildParams(search, stateCode, FULL_LIMIT, a11yFilters))
				const filtered = filterByDesignation(data.data, apiDesignation)
				return { ...data, data: filtered, total: String(filtered.length) }
			}
			return fetchParksApi(buildParams(search, stateCode, PREVIEW_LIMIT, a11yFilters))
		},
		staleTime: 24 * 60 * 60 * 1000,
	})

	const needsFullLoad = !apiDesignation

	const fullQuery = useQuery({
		queryKey: ['parks', 'full', search, stateCode, apiDesignation, a11yFilters],
		queryFn: () => fetchParksApi(buildParams(search, stateCode, FULL_LIMIT, a11yFilters)),
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

	const designations = fullQuery.isSuccess
		? buildDesignationList(fullQuery.data.data)
		: buildDesignationList(parks)

	return { parks, total, isLoading, isBackgroundLoading, error, isRefetching, designations }
}
