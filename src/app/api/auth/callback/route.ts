import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Handles PKCE code exchange for both magic link and OAuth flows.
 * Magic links now redirect here via emailRedirectTo in signInWithOtp options.
 */
export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url)
	const code = requestUrl.searchParams.get('code')
	const error = requestUrl.searchParams.get('error')
	const errorDescription = requestUrl.searchParams.get('error_description')
	const rawNext = requestUrl.searchParams.get('next') ?? '/'

	// Handle Supabase error redirects (expired tokens, reused links, etc.)
	if (error) {
		const message = errorDescription ?? 'Authentication failed.'
		const params = new URLSearchParams({ message: `${error}: ${message}` })
		return NextResponse.redirect(`${requestUrl.origin}/auth/error?${params}`, { status: 307 })
	}

	// Prevent open redirect: only allow same-origin paths
	const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

	if (code) {
		const supabase = await createClient()
		if (supabase) {
			const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
			if (!exchangeError) {
				return NextResponse.redirect(`${requestUrl.origin}${next}`, { status: 307 })
			}
		}
	}

	// Fallback: redirect to error page
	const params = new URLSearchParams({ message: 'Unable to verify your sign-in link. Please try again.' })
	return NextResponse.redirect(`${requestUrl.origin}/auth/error?${params}`, { status: 307 })
}
