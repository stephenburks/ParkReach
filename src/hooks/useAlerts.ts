'use client'

import { useQuery } from '@tanstack/react-query'
import type { NpsAlert } from '@/types/alert'

export function useAlerts(parkCode: string) {
	return useQuery<NpsAlert[]>({
		queryKey: ['alerts', parkCode],
		queryFn: async () => {
			const res = await fetch(`/api/alerts?parkCode=${parkCode}`)
			if (!res.ok) throw new Error('Failed to fetch alerts')
			const data = await res.json()
			return data.data ?? []
		},
		staleTime: 30 * 60 * 1000,
		enabled: Boolean(parkCode),
	})
}
