import type { Park } from '@/types/park'

export async function fetchPark(parkCode: string): Promise<Park | null> {
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
