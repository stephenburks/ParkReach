import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { jsonError } from '@/lib/api-response'

const NPS_BASE = 'https://developer.nps.gov/api/v1/parks'
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

interface NpsSyncResponse {
	total: string
	data: NpsParkItem[]
}

function transformImageUrl(url: string): string {
	if (!url) return url
	const gridMatch = url.match(/\/grid_small\/([^/?#]+\.(?:jpg|jpeg|png|webp))/i)
	if (gridMatch) {
		return `https://www.nps.gov/common/uploads/structured_data/${gridMatch[1]}`
	}
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
		if (changed) return parsed.toString()
	} catch { /* return as-is */ }
	return url
}

async function fetchPage(apiKey: string, start: number): Promise<NpsSyncResponse> {
	const params = new URLSearchParams({
		limit: String(BATCH_SIZE),
		start: String(start),
		api_key: apiKey,
	})
	const res = await fetch(`${NPS_BASE}?${params}`, {
		headers: { 'X-Api-Key': apiKey },
		next: { revalidate: 0 },
	})
	if (!res.ok) throw new Error(`NPS API returned ${res.status}`)
	return res.json()
}

async function upsertParks(
	supabase: Awaited<ReturnType<typeof createClient>>,
	parks: NpsParkItem[],
) {
	if (!supabase) throw new Error('Supabase client unavailable')

	const rows = parks.map((park) => ({
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
}

export async function GET(_request: NextRequest) {
	const apiKey = process.env.NPS_API_KEY
	if (!apiKey) {
		return jsonError('NPS API key not configured.', 503)
	}

	const supabase = await createClient()
	if (!supabase) {
		return jsonError('Supabase not configured.', 503)
	}

	const firstPage = await fetchPage(apiKey, 0)
	const total = parseInt(firstPage.total, 10)

	let synced = 0
	try {
		await upsertParks(supabase, firstPage.data)
		synced += firstPage.data.length

		for (let start = BATCH_SIZE; start < total; start += BATCH_SIZE) {
			const page = await fetchPage(apiKey, start)
			await upsertParks(supabase, page.data)
			synced += page.data.length
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error'
		return jsonError(`Sync failed: ${message}`, 500)
	}

	return NextResponse.json({ synced, total })
}
