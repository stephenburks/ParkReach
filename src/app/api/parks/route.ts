import { NextRequest, NextResponse } from 'next/server'

const NPS_BASE = 'https://developer.nps.gov/api/v1/parks'

export async function GET(request: NextRequest) {
	const sp = request.nextUrl.searchParams
	const q = sp.get('q') || ''
	const stateCode = sp.get('stateCode') || ''
	const designation = sp.get('designation') || ''
	const parkCode = sp.get('parkCode') || ''
	const limit = sp.get('limit') || '24'
	const start = sp.get('start') || '0'

	const params = new URLSearchParams({ limit, start })
	if (q) params.set('q', q)
	if (stateCode) params.set('stateCode', stateCode)
	if (designation) params.set('designation', designation)
	if (parkCode) params.set('parkCode', parkCode)

	try {
		const res = await fetch(`${NPS_BASE}?${params}`, {
			headers: { 'X-Api-Key': process.env.NPS_API_KEY! },
		})

		if (!res.ok) {
			return NextResponse.json({ error: 'NPS API error' }, { status: res.status })
		}

		const data = await res.json()
		if (data.error) {
			return NextResponse.json({ error: data.error }, { status: 400 })
		}

		return NextResponse.json(data, {
			headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' },
		})
	} catch (e) {
		console.error('[/api/parks] error:', e)
		return NextResponse.json({ error: 'Failed to fetch parks' }, { status: 500 })
	}
}
