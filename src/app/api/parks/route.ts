import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { jsonError } from '@/lib/api-response'

const NPS_BASE = 'https://developer.nps.gov/api/v1/parks'

function mapParkRow(row: {
	park_code: string
	full_name: string
	description: string | null
	states: string
	designation: string | null
	latitude: string | null
	longitude: string | null
	image_url: string | null
	image_alt: string | null
	url: string | null
}) {
	return {
		id: row.park_code,
		parkCode: row.park_code,
		fullName: row.full_name,
		description: row.description ?? '',
		states: row.states,
		designation: row.designation ?? '',
		latitude: row.latitude ?? '',
		longitude: row.longitude ?? '',
		images: row.image_url ? [{ url: row.image_url, altText: row.image_alt ?? '', title: '', credit: '', caption: '' }] : [],
		url: row.url ?? '',
		name: row.full_name,
		activities: [],
		topics: [],
		entranceFees: [],
		entrancePasses: [],
		operatingHours: [],
		weatherInfo: '',
		directionsInfo: '',
		directionsUrl: '',
	}
}

export async function GET(request: NextRequest) {
	const sp = request.nextUrl.searchParams
	const q = sp.get('q') || ''
	const stateCode = sp.get('stateCode') || ''
	const parkCode = sp.get('parkCode') || ''
	const limit = Math.min(600, Math.max(1, parseInt(sp.get('limit') || '20', 10) || 20))
	const start = Math.max(0, parseInt(sp.get('start') || '0', 10) || 0)

	// Search queries go to NPS API (Supabase doesn't have full-text search yet)
	if (q) {
		const apiKey = process.env.NPS_API_KEY
		if (!apiKey) {
			return jsonError('NPS API key not configured.', 503)
		}

		const npsParams = new URLSearchParams({ limit: String(limit), start: String(start) })
		npsParams.set('q', q)
		if (stateCode) npsParams.set('stateCode', stateCode)
		if (parkCode) npsParams.set('parkCode', parkCode)

		try {
			const fetchOptions: RequestInit = { headers: { 'X-Api-Key': apiKey } }
			if (limit <= 50) fetchOptions.next = { revalidate: 3600 }
			const res = await fetch(`${NPS_BASE}?${npsParams.toString().replace(/%2C/g, ',')}`, fetchOptions)

			if (!res.ok) return jsonError('NPS API error', res.status)
			const data = await res.json()
			if (data.error) return jsonError(data.error, 400)

			return NextResponse.json(data, {
				headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' },
			})
		} catch (e) {
			console.error('[/api/parks] NPS search error:', e)
			return jsonError('Failed to search parks', 500)
		}
	}

	// Non-search requests: try Supabase first
	const supabase = await createClient()
	if (supabase) {
		try {
			let query = supabase.from('parks').select('*', { count: 'exact' })

			if (stateCode) {
				query = query.filter('states', 'cs', `{${stateCode}}`)
			}
			if (parkCode) {
				const codes = parkCode.split(',')
				if (codes.length === 1) {
					query = query.eq('park_code', parkCode)
				} else {
					query = query.in('park_code', codes)
				}
			}

			query = query.range(start, start + limit - 1).order('full_name')

			const { data, count, error } = await query

			if (!error && data && data.length > 0) {
				const parks = data.map(mapParkRow)
				return NextResponse.json({
					total: String(count ?? parks.length),
					limit: String(limit),
					start: String(start),
					data: parks,
				}, {
					headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' },
				})
			}
		} catch {
			// Supabase query failed — fall through to NPS
		}
	}

	// Fallback: NPS API
	const apiKey = process.env.NPS_API_KEY
	if (!apiKey) {
		return jsonError('NPS API key not configured.', 503)
	}

	const npsParams = new URLSearchParams({ limit: String(limit), start: String(start) })
	if (stateCode) npsParams.set('stateCode', stateCode)
	if (parkCode) npsParams.set('parkCode', parkCode)

	try {
		const fetchOptions: RequestInit = { headers: { 'X-Api-Key': apiKey } }
		if (limit <= 50) fetchOptions.next = { revalidate: 3600 }
		const res = await fetch(`${NPS_BASE}?${npsParams.toString().replace(/%2C/g, ',')}`, fetchOptions)

		if (!res.ok) return jsonError('NPS API error', res.status)
		const data = await res.json()
		if (data.error) return jsonError(data.error, 400)

		return NextResponse.json(data, {
			headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' },
		})
	} catch (e) {
		console.error('[/api/parks] NPS fallback error:', e)
		return jsonError('Failed to fetch parks', 500)
	}
}
