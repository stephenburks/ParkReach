'use client'

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
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
	const [saves, setSaves] = useState<ParkSave[]>([])
	const [loading, setLoading] = useState(true)
	const { user } = useAuth()
	const supabase = useMemo(() => createClient(), [])

	const fetchSaves = useCallback(async () => {
		if (!user || !supabase) return []

		const { data, error } = await supabase
			.from('park_saves')
			.select('id, user_id, park_code, wishlisted, visited, created_at')
			.eq('user_id', user.id)

		return error ? [] : (data ?? [])
	}, [user, supabase])

	useEffect(() => {
		fetchSaves().then((result) => {
			setSaves(result)
			setLoading(false)
		})
	}, [fetchSaves])

	const toggleFlag = async (parkCode: string, field: 'wishlisted' | 'visited'): Promise<boolean> => {
		if (!user || !supabase) return false

		const existing = saves.find((save) => save.park_code === parkCode)

		if (existing) {
			const newValue = !existing[field]
			const patch = field === 'wishlisted' ? { wishlisted: newValue } : { visited: newValue }
			const { error } = await supabase
				.from('park_saves')
				.update(patch)
				.eq('id', existing.id)
			if (!error) {
				setSaves((prev) =>
					prev.map((save) => (save.id === existing.id ? { ...save, [field]: newValue } : save))
				)
			}
			return !error
		}

		const row =
			field === 'wishlisted'
				? { user_id: user.id, park_code: parkCode, wishlisted: true }
				: { user_id: user.id, park_code: parkCode, visited: true }
		const { data, error } = await supabase.from('park_saves').insert(row).select().single()
		if (!error && data) setSaves((prev) => [...prev, data])
		return !error
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
				toggleWishlist: (parkCode) => toggleFlag(parkCode, 'wishlisted'),
				toggleVisited: (parkCode) => toggleFlag(parkCode, 'visited'),
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
