'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { Database } from '@/types/supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export function useProfile() {
	const { supabase, user } = useAuth()
	const [profile, setProfile] = useState<Profile | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (!supabase || !user) {
			setProfile(null)
			setLoading(false)
			return
		}

		setLoading(true)
		supabase
			.from('profiles')
			.select('*')
			.eq('id', user.id)
			.single()
			.then(({ data }) => {
				setProfile(data)
				setLoading(false)
			})
	}, [supabase, user])

	const updateProfile = useCallback(
		async (updates: ProfileUpdate) => {
			if (!supabase || !user) return
			const { data } = await supabase
				.from('profiles')
				.update(updates)
				.eq('id', user.id)
				.select()
				.single()
			if (data) setProfile(data)
		},
		[supabase, user],
	)

	return { profile, loading, updateProfile }
}
