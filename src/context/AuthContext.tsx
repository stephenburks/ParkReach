'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

type AuthClient = NonNullable<ReturnType<typeof createClient>>

type AuthContextType = {
  supabase: AuthClient | null
  user: User | null
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  supabase: null,
  user: null,
  signOut: async () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient() ?? null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(() => supabase !== null)

	useEffect(() => {
		if (!supabase) return

		let isMounted = true

		const getUser = async () => {
			try {
				const { data: { user } } = await supabase.auth.getUser()
				if (isMounted) setUser(user)
			} catch {
				// Supabase unreachable (paused project, DNS failure, network issue)
			} finally {
				if (isMounted) setLoading(false)
			}
		}

		getUser()

		// onAuthStateChange updates the user on sign-in/sign-out events, but
		// does NOT touch loading — that's managed exclusively by getUser().
		// This prevents hydration mismatches when detectSessionInUrl fires
		// during client initialization.
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			if (isMounted) setUser(session?.user ?? null)
		})

		return () => {
			isMounted = false
			subscription.unsubscribe()
		}
	}, [supabase])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [supabase])

  const value = useMemo(
    () => ({ supabase, user, signOut, loading }),
    [supabase, user, signOut, loading]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}