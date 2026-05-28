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
