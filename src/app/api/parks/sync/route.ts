import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { jsonError } from '@/lib/api-response'

const NPS_BASE = 'https://developer.nps.gov/api/v1'
const BATCH_SIZE = 50

interface NpsParkItem {
	id: string
	fullName: string
	parkCode: string
	description: string
	states: string
	designation: string
	latitude: string
	longitude: string
	images: Array<{ url: string; altText: string }>
	url: string
}

interface NpsParkApiResponse {
	total: string
	data: NpsParkItem[]
}

interface NpsAlertItem {
	id: string
	title: string
	description: string
	category: string
	parkCode: string
}

interface NpsAlertApiResponse {
	total: string
	data: NpsAlertItem[]
}

interface NpsAmenityItem {
	name: string
	categories: string[]
	parkCode: string
}

interface NpsAmenityApiResponse {
	total: string
	data: NpsAmenityItem[]
}

// ---------------------------------------------------------------------------
// Image URL — replace thumbnail paths with full-resolution URLs
// ---------------------------------------------------------------------------

function transformImageUrl(url: string): string {
	if (!url) return url
	// Replace /grid_small/ paths with /structured_data/ (full-res equivalent)
	const gridMatch = url.match(/\/grid_small\/([^/?#]+\.(?:jpg|jpeg|png|webp))/i)
	if (gridMatch) {
		return `https://www.nps.gov/common/uploads/structured_data/${gridMatch[1]}`
	}
	// Strip query params that force a low-resolution render
	try {
		const parsed = new URL(url)
		let changed = false
		if (parsed.searchParams.has('width')) {
			parsed.searchParams.delete('width')
			changed = true
		}
		if (parsed.searchParams.has('quality')) {
			parsed.searchParams.delete('quality')
			changed = true
		}
		if (parsed.searchParams.has('size')) {
			parsed.searchParams.delete('size')
			changed = true
		}
		if (changed) return parsed.toString()
	} catch {
		// If URL parsing fails, return as-is
	}
	return url
}

// ---------------------------------------------------------------------------
// Accessibility — parse NPS amenities for known accessibility features
// ---------------------------------------------------------------------------

interface A11yFlags {
	has_wheelchair_access: boolean
	has_braille: boolean
	has_asl: boolean
	has_audio_description: boolean
	has_accessible_restrooms: boolean
	has_service_animal_relief: boolean
}

function parseAccessibility(
	amenities: NpsAmenityItem[],
	description: string,
): A11yFlags {
	const flags: A11yFlags = {
		has_wheelchair_access: false,
		has_braille: false,
		has_asl: false,
		has_audio_description: false,
		has_accessible_restrooms: false,
		has_service_animal_relief: false,
	}

	// Check structured amenities data
	for (const amenity of amenities) {
		const name = amenity.name.toLowerCase()
		if (name.includes('wheelchair')) flags.has_wheelchair_access = true
		if (name.includes('braille')) flags.has_braille = true
		if (name.includes('audio description')) flags.has_audio_description = true
		if (name.includes('accessible') && name.includes('restroom')) {
			flags.has_accessible_restrooms = true
		}
		// ASL and service animal relief not present in NPS amenities taxonomy,
		// so we don't set them from amenities alone.
	}

	// Fallback: parse park description free-text
	const lowerDesc = description.toLowerCase()
	if (!flags.has_wheelchair_access && lowerDesc.includes('wheelchair')) {
		flags.has_wheelchair_access = true
	}
	if (!flags.has_braille && lowerDesc.includes('braille')) {
		flags.has_braille = true
	}
	if (!flags.has_asl && (/\basl\b/.test(lowerDesc) || lowerDesc.includes('american sign language'))) {
		flags.has_asl = true
	}
	if (!flags.has_audio_description && lowerDesc.includes('audio description')) {
		flags.has_audio_description = true
	}
	if (!flags.has_accessible_restrooms && lowerDesc.includes('accessible restroom')) {
		flags.has_accessible_restrooms = true
	}
	if (!flags.has_service_animal_relief && lowerDesc.includes('service animal')) {
		flags.has_service_animal_relief = true
	}

	return flags
}

// ---------------------------------------------------------------------------
// Alerts — parse NPS alert categories
// ---------------------------------------------------------------------------

function parseAlerts(alerts: NpsAlertItem[]): {
	alert_count: number
	has_closure: boolean
	has_danger: boolean
	alert_level: string | null
} {
	const count = alerts.length
	let hasClosure = false
	let hasDanger = false
	let highest: string | null = null

	for (const alert of alerts) {
		const cat = alert.category.toLowerCase()
		if (cat.includes('closure')) {
			hasClosure = true
			if (!highest || highest === 'info' || highest === 'caution') {
				highest = 'closure'
			}
		} else if (cat === 'danger') {
			hasDanger = true
			if (!highest || highest === 'info' || highest === 'caution') {
				highest = 'danger'
			}
		} else if (cat === 'caution') {
			if (!highest || highest === 'info') {
				highest = 'caution'
			}
		} else if (cat === 'information') {
			if (!highest) highest = 'info'
		}
	}

	return {
		alert_count: count,
		has_closure: hasClosure,
		has_danger: hasDanger,
		alert_level: highest,
	}
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

async function fetchPage(apiKey: string, start: number): Promise<NpsParkApiResponse> {
	const params = new URLSearchParams({
		limit: String(BATCH_SIZE),
		start: String(start),
		api_key: apiKey,
	})
	const res = await fetch(`${NPS_BASE}/parks?${params}`, {
		headers: { 'X-Api-Key': apiKey },
		cache: 'no-store',
	})
	if (!res.ok) throw new Error(`NPS parks API returned ${res.status}`)
	return res.json()
}

async function fetchAmenities(
	apiKey: string,
	parkCode: string,
): Promise<NpsAmenityItem[]> {
	const params = new URLSearchParams({ parkCode, limit: '200', api_key: apiKey })
	const res = await fetch(`${NPS_BASE}/amenities?${params}`, {
		headers: { 'X-Api-Key': apiKey },
		cache: 'no-store',
	})
	if (!res.ok) return []
	const data: NpsAmenityApiResponse = await res.json()
	return data.data ?? []
}

async function fetchAlertsForPark(
	apiKey: string,
	parkCode: string,
): Promise<NpsAlertItem[]> {
	const params = new URLSearchParams({ parkCode, limit: '50', api_key: apiKey })
	const res = await fetch(`${NPS_BASE}/alerts?${params}`, {
		headers: { 'X-Api-Key': apiKey },
		cache: 'no-store',
	})
	if (!res.ok) return []
	const data: NpsAlertApiResponse = await res.json()
	return data.data ?? []
}

// ---------------------------------------------------------------------------
// Sync handler
// ---------------------------------------------------------------------------

export async function GET(_request: NextRequest) {
	const key = process.env.NPS_API_KEY
	if (!key) {
		return jsonError('NPS API key not configured.', 503)
	}
	const apiKey: string = key

	const supabase = await createClient()
	if (!supabase) {
		return jsonError('Supabase not configured.', 503)
	}

	// 1. Fetch all parks from NPS API
	const firstPage = await fetchPage(apiKey, 0)
	const total = parseInt(firstPage.total, 10)

	const allParks: NpsParkItem[] = [...firstPage.data]

	for (let start = BATCH_SIZE; start < total; start += BATCH_SIZE) {
		const page = await fetchPage(apiKey, start)
		allParks.push(...page.data)
	}

	// 2. Upsert parks (basic fields only at this stage)
	let synced = 0
	try {
		const rows = allParks.map((park) => ({
			park_code: park.parkCode,
			full_name: park.fullName,
			description: park.description,
			states: park.states,
			designation: park.designation,
			latitude: park.latitude,
			longitude: park.longitude,
			image_url: park.images?.[0]?.url
				? transformImageUrl(park.images[0].url)
				: null,
			image_alt: park.images?.[0]?.altText ?? null,
			url: park.url,
			updated_at: new Date().toISOString(),
		}))

		const { error } = await supabase.from('parks').upsert(rows, {
			onConflict: 'park_code',
		})
		if (error) throw new Error(`Upsert failed: ${error.message}`)
		synced = rows.length
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return jsonError(`Sync failed: ${message}`, 500)
	}

	// 3. Enrich with accessibility + alerts (park-by-park, with a concurrency cap)
	let enriched = 0
	let enrichmentErrors = 0
	const CONCURRENCY = 5 // NPS API rate limit: 1 000 req/h, keep it conservative

	async function enrichPark(park: NpsParkItem): Promise<void> {
		try {
			const [amenities, alerts] = await Promise.all([
				fetchAmenities(apiKey, park.parkCode),
				fetchAlertsForPark(apiKey, park.parkCode),
			])

			const a11y = parseAccessibility(amenities, park.description)
			const alertInfo = parseAlerts(alerts)

			const { error } = await supabase!
				.from('parks')
				.update({
					has_accessible_restrooms: a11y.has_accessible_restrooms,
					has_wheelchair_access: a11y.has_wheelchair_access,
					has_braille: a11y.has_braille,
					has_asl: a11y.has_asl,
					has_audio_description: a11y.has_audio_description,
					has_service_animal_relief: a11y.has_service_animal_relief,
					alert_count: alertInfo.alert_count,
					has_closure: alertInfo.has_closure,
					has_danger: alertInfo.has_danger,
					alert_level: alertInfo.alert_level,
					updated_at: new Date().toISOString(),
				})
				.eq('park_code', park.parkCode)

			if (error) {
				console.error(`[sync] Enrichment upsert failed for ${park.parkCode}:`, error.message)
				enrichmentErrors++
			} else {
				enriched++
			}
		} catch (err) {
			console.error(`[sync] Enrichment failed for ${park.parkCode}:`, err)
			enrichmentErrors++
		}
	}

	// Process in batches to respect concurrency limit
	for (let i = 0; i < allParks.length; i += CONCURRENCY) {
		const batch = allParks.slice(i, i + CONCURRENCY)
		await Promise.all(batch.map(enrichPark))
	}

	return NextResponse.json({
		synced,
		total,
		enriched,
		enrichmentErrors,
	})
}
