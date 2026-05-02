'use client';

import { useMemo, useState, useEffect } from 'react';
import { Park } from '@/types/park';
import { ParkCardMinimal } from './ParkCardMinimal';

interface Props {
  parks: Park[];
  onParkClick: (park: Park) => void;
}

function MapPlaceholder() {
  return (
    <div className="h-96 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center">
      <p className="text-stone-500 dark:text-stone-400">Loading map...</p>
    </div>
  );
}

function SimpleMap({ parks, onParkClick }: Props) {
  const [ReactLeaflet, setReactLeaflet] = useState<typeof import('react-leaflet') | null>(null);
  const [Leaflet, setLeaflet] = useState<typeof import('leaflet') | null>(null);

  useEffect(() => {
    Promise.all([
      import('react-leaflet'),
      import('leaflet'),
    ]).then(([rl, l]) => {
      setReactLeaflet(rl);
      setLeaflet(l);

      delete (l.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
      l.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    }).catch(console.error);
  }, []);

  const centers = useMemo(() => {
    return parks
      .filter((p) => p.latitude && p.longitude)
      .map((p) => [parseFloat(p.latitude), parseFloat(p.longitude)] as [number, number]);
  }, [parks]);

  const defaultCenter: [number, number] = centers.length > 0
    ? centers.reduce((acc, c) => [acc[0] + c[0] / centers.length, acc[1] + c[1] / centers.length], [0, 0] as [number, number])
    : [39.8283, -98.5795];

  if (!ReactLeaflet || !Leaflet) {
    return <MapPlaceholder />;
  }

  const { MapContainer, TileLayer, Marker } = ReactLeaflet;

  return (
    <div className="h-[500px] rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 relative z-0">
      <MapContainer center={defaultCenter} zoom={4} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {parks.slice(0, 50).map((park) => (
          <Marker
            key={park.parkCode}
            position={[parseFloat(park.latitude), parseFloat(park.longitude)]}
            eventHandlers={{
              click: () => onParkClick(park),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export function MapPanel({ parks, onParkClick }: Props) {
  return (
    <div className="space-y-4">
      {typeof window === 'undefined' ? (
        <MapPlaceholder />
      ) : (
        <SimpleMap parks={parks} onParkClick={onParkClick} />
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {parks.slice(0, 8).map((park) => (
          <ParkCardMinimal key={park.parkCode} park={park} onClick={() => onParkClick(park)} />
        ))}
      </div>
    </div>
  );
}