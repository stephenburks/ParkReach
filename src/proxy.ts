import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function buildCsp(): string {
	const evalDirective = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''
	const directives = [
		`default-src 'self'`,
		// 'self' covers _next/static chunks; 'unsafe-inline' covers Next.js inline scripts.
		// No nonce — Next.js doesn't reliably propagate x-nonce to inline scripts on Vercel.
		`script-src 'self' 'unsafe-inline'${evalDirective} https://maps.googleapis.com https://*.gstatic.com`,
		`style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
		`font-src 'self' data: https://fonts.gstatic.com`,
		`img-src 'self' data: blob: https://*.nps.gov https://*.googleapis.com https://*.gstatic.com https://*.supabase.co`,
		`connect-src 'self' https://*.supabase.co https://developer.nps.gov https://api.weather.gov https://maps.googleapis.com`,
		`frame-src 'none'`,
		`object-src 'none'`,
		`base-uri 'self'`,
	]
	return directives.join("; ")
}

export async function proxy(request: NextRequest) {
	const response = await updateSession(request);
	response.headers.set("Content-Security-Policy", buildCsp());
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
