import { NextRequest, NextResponse } from 'next/server'
import { jsonError } from '@/lib/api-response'

const NPS_BASE = 'https://developer.nps.gov/api/v1/parks'

export async function GET(request: NextRequest) {
	const apiKey = process.env.NPS_API_KEY
	if (!apiKey) {
		return jsonError('NPS API key not configured.', 503)
	}

	const sp = request.nextUrl.searchParams
	const q = sp.get('q') || ''
	const stateCode = sp.get('stateCode') || ''
	const designation = sp.get('designation') || ''
	const parkCode = sp.get('parkCode') || ''
	const limit = Math.min(600, Math.max(1, parseInt(sp.get('limit') || '20', 10) || 20))
	const start = Math.max(0, parseInt(sp.get('start') || '0', 10) || 0)

	const params = new URLSearchParams({ limit: String(limit), start: String(start) })
	if (q) params.set('q', q)
	if (stateCode) params.set('stateCode', stateCode)
	if (designation) params.set('designation', designation)
	if (parkCode) params.set('parkCode', parkCode)

	try {
		const res = await fetch(`${NPS_BASE}?${params}`, {
			headers: { 'X-Api-Key': apiKey },
		})

		if (!res.ok) {
			return jsonError('NPS API error', res.status)
		}

		const data = await res.json()
		if (data.error) {
			return jsonError(data.error, 400)
		}

		return NextResponse.json(data, {
			headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' },
		})
	} catch (e) {
		console.error('[/api/parks] error:', e)
		return jsonError('Failed to fetch parks', 500)
	}
}