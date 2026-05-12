'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import type { Database } from '@/types/supabase'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export function useProfile() {
	const { supabase, user } = useAuth()
	const queryClient = useQueryClient()

	const { data: profile = null, isLoading: loading } = useQuery({
		queryKey: ['profile', user?.id],
		queryFn: async () => {
			if (!supabase || !user) return null
			const { data } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', user.id)
				.single()
			return data
		},
		enabled: !!(supabase && user),
	})

	const updateProfileMutation = useMutation({
		mutationFn: async (updates: ProfileUpdate) => {
			if (!supabase || !user) return null
			const { data } = await supabase
				.from('profiles')
				.update(updates)
				.eq('id', user.id)
				.select()
				.single()
			return data
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
		},
	})

	async function updateProfile(updates: ProfileUpdate) {
		return updateProfileMutation.mutateAsync(updates)
	}

	return { profile, loading, updateProfile }
}