import Image from 'next/image'
import Link from 'next/link'
import { Sun, MapPin } from 'lucide-react'
import type { Park } from '@/types/park'

const NPS_BASE = 'https://developer.nps.gov/api/v1/parks'

function dateToIndex(dateStr: string, total: number): number {
	let hash = 5381
	for (let i = 0; i < dateStr.length; i++) {
		hash = ((hash << 5) + hash) ^ dateStr.charCodeAt(i)
		hash = hash | 0
	}
	return Math.abs(hash) % total
}

async function getTodaysPark(): Promise<Park | null> {
	const apiKey = process.env.NPS_API_KEY
	if (!apiKey) return null

	const headers = { 'X-Api-Key': apiKey }

	try {
		const countRes = await fetch(`${NPS_BASE}?limit=1`, {
			headers,
			next: { revalidate: 86400 },
		})
		if (!countRes.ok) return null
		const { total } = await countRes.json()

		const today = new Date().toISOString().slice(0, 10)
		const index = dateToIndex(today, parseInt(total, 10))

		const parkRes = await fetch(`${NPS_BASE}?limit=1&start=${index}`, {
			headers,
			next: { revalidate: 86400 },
		})
		if (!parkRes.ok) return null
		const data = await parkRes.json()
		return data.data?.[0] ?? null
	} catch {
		return null
	}
}

export async function ParkOfTheDay() {
	const park = await getTodaysPark()
	if (!park) return null

	const image = park.images?.[0]
	const states = park.states?.split(',').join(' · ')

	return (
		<section aria-label="Park of the Day">
			<div className="relative h-72 sm:h-[420px] overflow-hidden bg-gradient-to-br from-park-forest to-park-sage">
				{image?.url && (
					<Image
						src={image.url}
						alt={image.altText || park.fullName}
						fill
						className="object-cover"
						priority
						sizes="100vw"
					/>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

				<div className="absolute inset-0 flex flex-col justify-end">
					<div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-6 sm:pb-10">
						<span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 bg-park-forest/80 backdrop-blur-sm px-3 py-1 rounded-full w-fit mb-3">
							<Sun className="h-3.5 w-3.5" aria-hidden="true" /> Park of the Day
						</span>
						<h2 className="text-2xl sm:text-4xl font-bold text-white leading-tight mb-1">
							{park.fullName}
						</h2>
						{states && (
							<p className="text-sm text-white/70 mb-3">
								<MapPin className="h-3.5 w-3.5 inline mr-1" aria-hidden="true" />{states}
							</p>
						)}
						<p className="text-sm sm:text-base text-white/80 line-clamp-2 mb-5 max-w-2xl">
							{park.description}
						</p>
						<Link
							href={`/parks/${park.parkCode}`}
							className="inline-flex items-center gap-2 bg-white text-park-bark font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-park-cream transition-colors w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/50"
						>
							Explore this park →
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}
