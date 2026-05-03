import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Refreshes the Supabase session on every request so auth tokens don't
 * silently expire mid-session. Called from src/proxy.ts.
 *
 * Uses getUser() — not getSession() — because getSession() does not
 * revalidate the JWT against the server.
 *
 * @param additionalRequestHeaders - Extra headers to forward to RSC (e.g. x-nonce for CSP).
 */
export async function updateSession(
	request: NextRequest,
	additionalRequestHeaders: Record<string, string> = {},
) {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	const forwardHeaders = new Headers(request.headers);
	for (const [key, value] of Object.entries(additionalRequestHeaders)) {
		forwardHeaders.set(key, value);
	}

	// If Supabase isn't configured (e.g. local dev without keys), pass through.
	if (!url || !anonKey) {
		return NextResponse.next({ request: { headers: forwardHeaders } });
	}

	let supabaseResponse = NextResponse.next({ request: { headers: forwardHeaders } });

	const supabase = createServerClient(url, anonKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				cookiesToSet.forEach(({ name, value }) =>
					request.cookies.set(name, value),
				);
				supabaseResponse = NextResponse.next({ request: { headers: forwardHeaders } });
				cookiesToSet.forEach(({ name, value, options }) =>
					supabaseResponse.cookies.set(name, value, options),
				);
			},
		},
	});

	// Refresh the session. Must use getUser() — getSession() skips JWT validation.
	await supabase.auth.getUser();

	return supabaseResponse;
}
