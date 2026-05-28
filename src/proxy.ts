import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function buildCsp(nonce: string): string {
	const evalDirective = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''
	const directives = [
		`default-src 'self'`,
		`script-src 'self' 'nonce-${nonce}' 'unsafe-inline'${evalDirective} https://maps.googleapis.com`,
		`style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
		`font-src 'self' data: https://fonts.gstatic.com`,
		`img-src 'self' data: blob: https://*.nps.gov https://*.googleapis.com https://*.gstatic.com`,
		`connect-src 'self' https://*.supabase.co https://developer.nps.gov https://api.weather.gov https://maps.googleapis.com`,
		`frame-src 'none'`,
		`object-src 'none'`,
		`base-uri 'self'`,
	]
	return directives.join("; ")
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
