import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { jsonError } from '@/lib/api-response'
import { fetchParkEnrichment, formatNpsAccessibility } from '@/lib/nps'
import type { Park } from '@/types/park'

const NPS_BASE = 'https://developer.nps.gov/api/v1/parks'

interface ParkDbRow {
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
	has_accessible_restrooms?: boolean | null
	has_wheelchair_access?: boolean | null
	has_braille?: boolean | null
	has_asl?: boolean | null
	has_audio_description?: boolean | null
	has_service_animal_relief?: boolean | null
	alert_count?: number | null
	has_closure?: boolean | null
	has_danger?: boolean | null
	alert_level?: string | null
}

function mapParkRow(row: ParkDbRow): Park {
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
		has_accessible_restrooms: row.has_accessible_restrooms ?? false,
		has_wheelchair_access: row.has_wheelchair_access ?? false,
		has_braille: row.has_braille ?? false,
		has_asl: row.has_asl ?? false,
		has_audio_description: row.has_audio_description ?? false,
		has_service_animal_relief: row.has_service_animal_relief ?? false,
		alert_count: row.alert_count ?? 0,
		has_closure: row.has_closure ?? false,
		has_danger: row.has_danger ?? false,
		alert_level: row.alert_level ?? null,
	}
}

function parseBoolParam(param: string | null): boolean | undefined {
	if (param === 'true' || param === '1') return true
	if (param === 'false' || param === '0') return false
	return undefined
}

export async function GET(request: NextRequest) {
	const sp = request.nextUrl.searchParams
	const q = sp.get('q') || ''
	const stateCode = sp.get('stateCode') || ''
	const parkCode = sp.get('parkCode') || ''
	const limit = Math.min(600, Math.max(1, parseInt(sp.get('limit') || '20', 10) || 20))
	const start = Math.max(0, parseInt(sp.get('start') || '0', 10) || 0)

	// Accessibility filter params
	const hasWheelchair = parseBoolParam(sp.get('hasWheelchair'))
	const hasBraille = parseBoolParam(sp.get('hasBraille'))
	const hasAsl = parseBoolParam(sp.get('hasAsl'))
	const hasAudioDescription = parseBoolParam(sp.get('hasAudioDescription'))
	const hasA11yFilters = hasWheelchair !== undefined || hasBraille !== undefined ||
		hasAsl !== undefined || hasAudioDescription !== undefined

	// Search queries go to NPS API (Supabase doesn't have full-text search yet)
	// NOTE: a11y filters only work with Supabase — when a search query is present,
	// a11y filtering is not applied (NPS API doesn't support these filters)
	if (q && !hasA11yFilters) {
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

	// Non-search requests (or a11y-filtered requests): try Supabase first
	const supabase = await createClient()
	if (supabase) {
		try {
			let query = supabase.from('parks').select('park_code,full_name,description,states,designation,latitude,longitude,image_url,image_alt,url,has_accessible_restrooms,has_wheelchair_access,has_braille,has_asl,has_audio_description,has_service_animal_relief,alert_count,has_closure,has_danger,alert_level', { count: 'exact' })

			if (stateCode) {
				query = query.ilike('states', `%${stateCode}%`)
			}
			if (parkCode) {
				const codes = parkCode.split(',')
				if (codes.length === 1) {
					query = query.eq('park_code', parkCode)
				} else {
					query = query.in('park_code', codes)
				}
			}

			// Accessibility filters (server-side, exact boolean match)
			if (hasWheelchair !== undefined) {
				query = query.eq('has_wheelchair_access', hasWheelchair)
			}
			if (hasBraille !== undefined) {
				query = query.eq('has_braille', hasBraille)
			}
			if (hasAsl !== undefined) {
				query = query.eq('has_asl', hasAsl)
			}
			if (hasAudioDescription !== undefined) {
				query = query.eq('has_audio_description', hasAudioDescription)
			}

			// When a11y filters + search query are both present, also filter
			// by search term client-side via a post-filter on full_name
			if (q && hasA11yFilters) {
				query = query.ilike('full_name', `%${q}%`)
			}

			query = query.range(start, start + limit - 1).order('full_name')

			const { data, count, error } = await query

			if (!error && data && data.length > 0) {
				const parks = data.map(mapParkRow)

				// Enrich activities/topics from NPS for single-park lookups.
				// NOTE: listings (multiple parks, search queries) skip enrichment —
				// activities/topics are only displayed on detail pages and modals,
				// never on listing cards. Adding an NPS call per row in a listing
				// would be too slow and wasteful.
				const codes = parkCode.split(',').filter(Boolean)
				if (codes.length === 1 && parks.length === 1 && !q) {
					const apiKey = process.env.NPS_API_KEY
					if (apiKey) {
						const enriched = await fetchParkEnrichment(codes[0], apiKey)
						if (enriched?.data?.[0]) {
							const ed = enriched.data[0]
							parks[0].activities = ed.activities ?? []
							parks[0].topics = ed.topics ?? []
							parks[0].operatingHours = ed.operatingHours ?? []
							parks[0].entranceFees = ed.entranceFees ?? []
							parks[0].entrancePasses = ed.entrancePasses ?? []
							parks[0].weatherInfo = ed.weatherInfo ?? ''
							parks[0].directionsUrl = ed.directionsUrl ?? ''
							parks[0].directionsInfo = ed.directionsInfo ?? ''
							parks[0].accessibility = formatNpsAccessibility(ed.accessibility)
						}
					}
				}

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

	// If a11y filters are active, don't fall back to NPS API.
	// NPS API has no accessibility data, so falling back would return
	// results that silently ignore the user's accessibility filter choices.
	if (hasA11yFilters) {
		return NextResponse.json({
			total: '0',
			limit: String(limit),
			start: String(start),
			data: [],
		}, {
			headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=3600' },
		})
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
