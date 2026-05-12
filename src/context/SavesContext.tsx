'use client'

import { createContext, useContext } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'

type ParkSave = {
	id: string
	user_id: string
	park_code: string
	wishlisted: boolean
	visited: boolean
	created_at: string
}

type SavesContextType = {
	saves: ParkSave[]
	loading: boolean
	toggleWishlist: (parkCode: string) => Promise<boolean>
	toggleVisited: (parkCode: string) => Promise<boolean>
	isWishlisted: (parkCode: string) => boolean
	isVisited: (parkCode: string) => boolean
	isAuthenticated: boolean
}

const SavesContext = createContext<SavesContextType>({
	saves: [],
	loading: true,
	toggleWishlist: async () => false,
	toggleVisited: async () => false,
	isWishlisted: () => false,
	isVisited: () => false,
	isAuthenticated: false,
})

export function SavesProvider({ children }: { children: React.ReactNode }) {
	const { user, supabase } = useAuth()
	const queryClient = useQueryClient()

	const { data: saves = [], isLoading: loading } = useQuery({
		queryKey: ['saves', user?.id],
		queryFn: async () => {
			if (!user || !supabase) return []
			const { data, error } = await supabase
				.from('park_saves')
				.select('id, user_id, park_code, wishlisted, visited, created_at')
				.eq('user_id', user.id)
			return error ? [] : (data ?? [])
		},
		enabled: !!(user && supabase),
	})

	const toggleMutation = useMutation({
		mutationFn: async ({ parkCode, field }: { parkCode: string; field: 'wishlisted' | 'visited' }) => {
			if (!user || !supabase) return false

			const existing = saves.find((save) => save.park_code === parkCode)

			if (existing) {
				const newValue = !existing[field]
				const patch = field === 'wishlisted' ? { wishlisted: newValue } : { visited: newValue }
				const { error } = await supabase
					.from('park_saves')
					.update(patch)
					.eq('id', existing.id)
				return !error
			}

			const row =
				field === 'wishlisted'
					? { user_id: user.id, park_code: parkCode, wishlisted: true }
					: { user_id: user.id, park_code: parkCode, visited: true }
			const { error } = await supabase.from('park_saves').insert(row).select().single()
			return !error
		},
		onMutate: async ({ parkCode, field }) => {
			await queryClient.cancelQueries({ queryKey: ['saves', user?.id] })
			const previousSaves = queryClient.getQueryData<ParkSave[]>(['saves', user?.id])

			queryClient.setQueryData<ParkSave[]>(['saves', user?.id], (old) => {
				if (!old) return old
				const existing = old.find((save) => save.park_code === parkCode)

				if (existing) {
					const newValue = !existing[field]
					return old.map((save) =>
						save.id === existing.id ? { ...save, [field]: newValue } : save,
					)
				}

				const tempSave: ParkSave = {
					id: `temp-${Date.now()}`,
					user_id: user?.id ?? '',
					park_code: parkCode,
					wishlisted: field === 'wishlisted',
					visited: field === 'visited',
					created_at: new Date().toISOString(),
				}
				return [...old, tempSave]
			})

			return { previousSaves }
		},
		onError: (_err, _variables, context) => {
			if (context?.previousSaves) {
				queryClient.setQueryData(['saves', user?.id], context.previousSaves)
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ['saves', user?.id] })
		},
	})

	async function toggleWishlist(parkCode: string): Promise<boolean> {
		try {
			return await toggleMutation.mutateAsync({ parkCode, field: 'wishlisted' })
		} catch {
			return false
		}
	}

	async function toggleVisited(parkCode: string): Promise<boolean> {
		try {
			return await toggleMutation.mutateAsync({ parkCode, field: 'visited' })
		} catch {
			return false
		}
	}

	const isWishlisted = (parkCode: string) =>
		saves.some((save) => save.park_code === parkCode && save.wishlisted)

	const isVisited = (parkCode: string) =>
		saves.some((save) => save.park_code === parkCode && save.visited)

	return (
		<SavesContext.Provider
			value={{
				saves,
				loading,
				toggleWishlist,
				toggleVisited,
				isWishlisted,
				isVisited,
				isAuthenticated: !!user,
			}}
		>
			{children}
		</SavesContext.Provider>
	)
}

export function useSaves() {
	return useContext(SavesContext)
}