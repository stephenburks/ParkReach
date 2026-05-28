import { createClient } from '@/lib/supabase/server'
import type { Park } from '@/types/park'

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
	const supabase = await createClient()
	if (supabase) {
		const { data, error } = await supabase
			.from('parks')
			.select('*')
			.eq('park_code', parkCode)
			.single()

		if (!error && data) {
			return mapParkRow(data)
		}
	}

	const apiKey = process.env.NPS_API_KEY
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
