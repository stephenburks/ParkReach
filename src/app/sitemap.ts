import { MetadataRoute } from 'next'

const BASE_URL = 'https://parkreach.app'

interface ParkData {
	parkCode: string
	fullName: string
}

async function getParks(): Promise<ParkData[]> {
	try {
		const res = await fetch('https://developer.nps.gov/api/v1/parks?limit=500&fields=parkCode,fullName', {
			headers: {
				Authorization: process.env.NPS_API_KEY ?? '',
			},
			next: { revalidate: 86400 },
		})

		if (!res.ok) {
			console.error('NPS API error:', res.status)
			return []
		}

		const data = await res.json()
		return data.data ?? []
	} catch (err) {
		console.error('Failed to fetch parks:', err)
		return []
	}
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const parks = await getParks()

	const staticRoutes: MetadataRoute.Sitemap = [
		{
			url: BASE_URL,
			lastModified: new Date(),
			changeFrequency: 'daily',
			priority: 1,
		},
		{
			url: `${BASE_URL}/profile`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.5,
		},
		{
			url: `${BASE_URL}/auth/login`,
			lastModified: new Date(),
			changeFrequency: 'monthly',
			priority: 0.3,
		},
	]

	const parkRoutes: MetadataRoute.Sitemap = parks.map((park) => ({
		url: `${BASE_URL}/parks/${park.parkCode}`,
		lastModified: new Date(),
		changeFrequency: 'weekly' as const,
		priority: 0.6,
	}))

	return [...staticRoutes, ...parkRoutes]
}
