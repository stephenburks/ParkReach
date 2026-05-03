import { useQuery } from '@tanstack/react-query'
import type { Park } from '@/types/park'

async function fetchParksByCode(codes: string[]): Promise<Park[]> {
	if (codes.length === 0) return []
	const params = new URLSearchParams({ parkCode: codes.join(','), limit: String(codes.length) })
	const res = await fetch(`/api/parks?${params}`)
	if (!res.ok) throw new Error('Failed to fetch park details')
	const data = await res.json()
	return data.data ?? []
}

export function useParksByCode(codes: string[]) {
	const sorted = [...codes].sort().join(',')

	return useQuery({
		queryKey: ['parks-by-code', sorted],
		queryFn: () => fetchParksByCode(codes),
		enabled: codes.length > 0,
		staleTime: 24 * 60 * 60 * 1000,
	})
}
