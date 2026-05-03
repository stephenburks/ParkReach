import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function buildCsp(nonce: string): string {
	const directives = [
		`default-src 'self'`,
		// 'strict-dynamic' lets trusted scripts (nonce'd) load further dynamic chunks.
		// Domains are redundant with strict-dynamic but kept for older browsers.
		`script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://maps.googleapis.com`,
		// Inline styles are required by Tailwind CSS v4 and Google Maps widget.
		`style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
		`font-src 'self' data: https://fonts.gstatic.com`,
		`img-src 'self' data: blob: https://*.nps.gov https://*.googleapis.com https://*.gstatic.com`,
		`connect-src 'self' https://*.supabase.co https://developer.nps.gov https://api.weather.gov https://maps.googleapis.com`,
		`frame-src 'none'`,
		`object-src 'none'`,
		`base-uri 'self'`,
	];
	return directives.join("; ");
}

export async function proxy(request: NextRequest) {
	const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
	const csp = buildCsp(nonce);

	// x-nonce in request headers: Next.js App Router reads this and stamps the
	// nonce onto its own generated inline scripts.
	const response = await updateSession(request, { "x-nonce": nonce });
	response.headers.set("Content-Security-Policy", csp);

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static  (static assets)
		 * - _next/image   (image optimisation)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 */
		"/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
	],
};
