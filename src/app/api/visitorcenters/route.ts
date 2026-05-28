import { NextRequest, NextResponse } from 'next/server'
import { jsonError } from '@/lib/api-response'
import { isValidParkCode } from '@/lib/validate-park-code'

export async function GET(request: NextRequest) {
	const parkCode = request.nextUrl.searchParams.get('parkCode')

	if (!parkCode) {
		return jsonError('parkCode query parameter is required', 400)
	}

	if (!isValidParkCode(parkCode)) {
		return jsonError('Invalid park code.', 400)
	}

	const apiKey = process.env.NPS_API_KEY
	if (!apiKey) {
		return jsonError('NPS API key not configured.', 503)
	}

	try {
		const url = new URL('https://developer.nps.gov/api/v1/visitorcenters')
		url.searchParams.set('parkCode', parkCode)
		url.searchParams.set('limit', '50')

		const res = await fetch(url.toString(), {
			headers: { 'X-Api-Key': apiKey },
			next: { revalidate: 21600 },
		})

		if (!res.ok) {
			return jsonError('NPS API error', res.status)
		}

		const data = await res.json()
		return NextResponse.json(data, {
			headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=21600' },
		})
	} catch {
		return jsonError('Failed to fetch visitor centers.', 500)
	}
}
