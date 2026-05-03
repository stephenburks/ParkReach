import { createBrowserClient } from '@supabase/ssr'

import type { Database } from '@/types/supabase'

let _instance: ReturnType<typeof createBrowserClient<Database>> | undefined

export function createClient() {
	if (!_instance) {
		_instance = createBrowserClient<Database>(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
		)
	}
	return _instance
}
