'use client'

import { useState } from 'react'
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps'
import { Park } from '@/types/park'

interface Props {
	parks: Park[]
	onParkSelect: (park: Park) => void
}

const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 }
const DEFAULT_ZOOM = 4

export function ParkMap({ parks, onParkSelect }: Props) {
	const [selectedPark, setSelectedPark] = useState<Park | null>(null)

	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

	if (!apiKey) {
		return (
			<div className="h-[600px] flex items-center justify-center bg-stone-100 dark:bg-stone-800 rounded-xl">
				<p className="text-park-stone">Map unavailable — API key not configured</p>
			</div>
		)
	}

	const parksWithCoords = parks.filter(
		(p) => p.latitude && p.longitude,
	)

	return (
		<APIProvider apiKey={apiKey}>
			<div
				className="h-[600px] rounded-xl overflow-hidden border border-stone-200 dark:border-stone-700"
				role="application"
				aria-label="Map of national parks"
			>
				<Map
					defaultCenter={DEFAULT_CENTER}
					defaultZoom={DEFAULT_ZOOM}
					gestureHandling="greedy"
					disableDefaultUI={false}
				>
					{parksWithCoords.map((park) => (
						<AdvancedMarker
							key={park.parkCode}
							position={{
								lat: parseFloat(park.latitude),
								lng: parseFloat(park.longitude),
							}}
							title={park.fullName}
							onClick={() => setSelectedPark(park)}
						/>
					))}

					{selectedPark && (
						<InfoWindow
							position={{
								lat: parseFloat(selectedPark.latitude),
								lng: parseFloat(selectedPark.longitude),
							}}
							onCloseClick={() => setSelectedPark(null)}
						>
							<div className="p-1 max-w-[250px]">
								<h3 className="font-semibold text-sm text-park-bark dark:text-park-cream mb-1">
									{selectedPark.fullName}
								</h3>
								<p className="text-xs text-stone-500 mb-2">
									{selectedPark.states.split(',').join(' · ')}
								</p>
								<button
									onClick={() => onParkSelect(selectedPark)}
									className="text-xs text-park-forest font-medium hover:underline"
								>
									View details →
								</button>
							</div>
						</InfoWindow>
					)}
				</Map>
			</div>
		</APIProvider>
	)
}
