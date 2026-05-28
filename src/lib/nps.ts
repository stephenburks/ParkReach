import { createClient } from '@/lib/supabase/server'
import type { Park } from '@/types/park'

export function formatNpsAccessibility(accessibility: unknown): string {
	if (!accessibility) return ''
	if (typeof accessibility === 'string') return accessibility
	if (typeof accessibility === 'object') {
		const a = accessibility as Record<string, unknown>
		const lines: string[] = []

		if (a.wheelchairAccess && a.wheelchairAccess !== 'No') {
			lines.push(`Wheelchair access: ${a.wheelchairAccess}`)
		}
		if (a.internetInfo) lines.push(`Internet: ${a.internetInfo}`)
		if (a.cellPhoneInfo) lines.push(`Cell phone: ${a.cellPhoneInfo}`)
		if (a.fireStovePolicy) lines.push(`Fire/stove policy: ${a.fireStovePolicy}`)
		if (a.rvAllowed && a.rvAllowed !== 'No') {
			const rvItems = [a.rvAllowed]
			if (a.rvInfo) rvItems.push(a.rvInfo)
			if (a.rvMaxLength) rvItems.push(`Max length: ${a.rvMaxLength}`)
			lines.push(`RV access: ${rvItems.join(' — ')}`)
		}
		if (Array.isArray(a.classifications) && a.classifications.length > 0) {
			lines.push(`Classification: ${a.classifications.join(', ')}`)
		}
		if (Array.isArray(a.areasAccessible) && a.areasAccessible.length > 0) {
			lines.push(`Accessible areas: ${a.areasAccessible.join(', ')}`)
		}
		if (a.additionalInfo) lines.push(String(a.additionalInfo))
		if (a.entranceFeeException) lines.push(String(a.entranceFeeException))

		return lines.join('\n\n')
	}
	return ''
}

interface NpsEnrichmentResponse {
	data?: Array<{
		activities?: Park['activities']
		topics?: Park['topics']
		operatingHours?: Park['operatingHours']
		entranceFees?: Park['entranceFees']
		entrancePasses?: Park['entrancePasses']
		weatherInfo?: string
		directionsUrl?: string
		directionsInfo?: string
		accessibility?: unknown
	}>
}

/**
 * Lightweight NPS fetch for park detail enrichment.
 * Only called for single-park lookups — never for listings.
 */
export async function fetchParkEnrichment(
	parkCode: string,
	apiKey: string,
): Promise<NpsEnrichmentResponse | null> {
	try {
		const fields = 'activities,topics,operatingHours,entranceFees,entrancePasses,weatherInfo,directionsUrl,directionsInfo,accessibility'
		const res = await fetch(
			`https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}&fields=${fields}`,
			{
				headers: { 'X-Api-Key': apiKey },
				next: { revalidate: 3600 },
			},
		)
		if (!res.ok) return null
		return (await res.json()) as NpsEnrichmentResponse
	} catch {
		return null
	}
}

/**
 * Fetches accessibility amenity names for a park from the NPS amenities endpoint.
 * Returns a formatted text string or null if no accessibility amenities found.
 */
export async function fetchParkAccessibility(
	parkCode: string,
	apiKey: string,
): Promise<string | null> {
	try {
		const res = await fetch(
			`https://developer.nps.gov/api/v1/amenities?parkCode=${parkCode}&limit=200`,
			{
				headers: { 'X-Api-Key': apiKey },
				next: { revalidate: 3600 },
			},
		)
		if (!res.ok) return null
		const data = await res.json()
		const amenities: Array<{ name: string; categories: string[] }> = data.data ?? []

		const accessibilityAmenities = amenities
			.filter((a) => {
				const name = a.name?.toLowerCase() ?? ''
				const categories = a.categories ?? []
				return name.includes('accessible') || categories.includes('Accessibility')
			})
			.map((a) => a.name)
			.filter(Boolean)

		return accessibilityAmenities.length > 0 ? accessibilityAmenities.join('\n\n') : null
	} catch {
		return null
	}
}

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
}): Park {
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

export async function fetchPark(parkCode: string): Promise<Park | null> {
	const apiKey = process.env.NPS_API_KEY

	const supabase = await createClient()
	if (supabase) {
		const { data, error } = await supabase
			.from('parks')
			.select('*')
			.eq('park_code', parkCode)
			.single()

		if (!error && data) {
			const park = mapParkRow(data)
			// Enrich with detail fields from NPS (Supabase rows omit these)
			if (apiKey) {
				const enrichment = await fetchParkEnrichment(parkCode, apiKey)
				if (enrichment?.data?.[0]) {
					const ed = enrichment.data[0]
					park.activities = ed.activities ?? []
					park.topics = ed.topics ?? []
					park.operatingHours = ed.operatingHours ?? []
					park.entranceFees = ed.entranceFees ?? []
					park.entrancePasses = ed.entrancePasses ?? []
					park.weatherInfo = ed.weatherInfo ?? ''
					park.directionsUrl = ed.directionsUrl ?? ''
					park.directionsInfo = ed.directionsInfo ?? ''
					park.accessibility = formatNpsAccessibility(ed.accessibility)
				}
			}
			return park
		}
	}

	if (!apiKey) return null

	const res = await fetch(
		`https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}&fields=images,operatingHours,entranceFees,entrancePasses,activities,topics,directionsUrl,weatherInfo,accessibility`,
		{
			headers: { 'X-Api-Key': apiKey },
			next: { revalidate: 3600 },
		},
	)

	if (!res.ok) return null
	const data = await res.json()
	return data.data?.[0] ?? null
}
