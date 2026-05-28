import { NextRequest, NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { jsonError } from '@/lib/api-response'
import type { Database } from '@/types/supabase'

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
	supabase: SupabaseClient<Database>,
	parks: NpsParkItem[],
) {
	const rows = parks.map((park) => ({
		park_code: park.parkCode,
		full_name: park.fullName,
		description: park.description,
		states: park.states,
		designation: park.designation,
		latitude: park.latitude,
		longitude: park.longitude,
		image_url: park.images?.[0]?.url ?? null,
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

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

	if (!supabaseUrl || !serviceRoleKey) {
		return jsonError('Supabase not configured (missing URL or service role key).', 503)
	}

	const supabase = createClient<Database>(supabaseUrl, serviceRoleKey)

	// Get total count from first page
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
