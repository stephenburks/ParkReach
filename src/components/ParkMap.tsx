'use client'

import { useEffect, useRef, useState } from 'react'
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import type { Park } from '@/types/park'

interface Props {
	parks: Park[]
	onParkSelect: (park: Park) => void
}

const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 }
const DEFAULT_ZOOM = 4

// Separated so it can access the map via useMap() inside <APIProvider>
function ClusteredPins({ parks, onParkSelect }: Props) {
	const map = useMap()
	const clusterer = useRef<MarkerClusterer | null>(null)
	const [selectedPark, setSelectedPark] = useState<Park | null>(null)
	const [markerEls, setMarkerEls] = useState<
		Record<string, google.maps.marker.AdvancedMarkerElement>
	>({})

	useEffect(() => {
		if (!map) return
		clusterer.current ??= new MarkerClusterer({ map })
	}, [map])

	useEffect(() => {
		clusterer.current?.clearMarkers()
		clusterer.current?.addMarkers(Object.values(markerEls))
	}, [markerEls])

	const setMarkerRef = (
		el: google.maps.marker.AdvancedMarkerElement | null,
		key: string,
	) => {
		setMarkerEls((prev) => {
			if (el && prev[key] === el) return prev
			if (!el && !prev[key]) return prev
			const next = { ...prev }
			if (el) {
				next[key] = el
			} else {
				delete next[key]
			}
			return next
		})
	}

	const parksWithCoords = parks.filter((park) => park.latitude && park.longitude)

	return (
		<>
			{parksWithCoords.map((park) => (
				<AdvancedMarker
					key={park.parkCode}
					ref={(el) => setMarkerRef(el, park.parkCode)}
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
						<h3 className="font-semibold text-sm mb-1">{selectedPark.fullName}</h3>
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
		</>
	)
}

export function ParkMap({ parks, onParkSelect }: Props) {
	const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

	if (!apiKey) {
		return (
			<div className="h-[600px] flex items-center justify-center bg-stone-100 dark:bg-stone-800 rounded-xl">
				<p className="text-park-stone">Map unavailable — API key not configured</p>
			</div>
		)
	}

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
					mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? ''}
				>
					<ClusteredPins parks={parks} onParkSelect={onParkSelect} />
				</Map>
			</div>
		</APIProvider>
	)
}
