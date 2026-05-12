import { createBrowserClient } from '@supabase/ssr'

import type { Database } from '@/types/supabase'

let _instance: ReturnType<typeof createBrowserClient<Database>> | null = null

export function createClient() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	if (!url || !anonKey) return null

	if (!_instance) {
		_instance = createBrowserClient<Database>(url, anonKey, {
			auth: {
				autoRefreshToken: true,
				detectSessionInUrl: true,
				persistSession: true,
			},
			global: {
				fetch: (input, init) => {
					return fetch(input, { ...init, signal: init?.signal ?? AbortSignal.timeout(10_000) })
				},
			},
		})
	}
	return _instance
}
