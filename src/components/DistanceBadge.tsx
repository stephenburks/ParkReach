'use client';

import { Car, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  parkCode: string;
  latitude?: string;
  longitude?: string;
}

interface DistanceData {
  parkCode: string;
  drivingMiles: string | null;
  drivingTime: string | null;
  message: string;
}

export function DistanceBadge({ parkCode, latitude, longitude }: Props) {
  const [distance, setDistance] = useState<DistanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!latitude || !longitude) {
      setLoading(false);
      return;
    }

    const params = new URLSearchParams({ lat: latitude, lon: longitude });
    fetch(`/api/distance/${parkCode}?${params}`)
      .then((res) => res.json())
      .then(setDistance)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [parkCode, latitude, longitude]);

  if (!latitude || !longitude) return null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 animate-pulse inline-flex items-center gap-2">
        <Car className="h-4 w-4" />
        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-20" />
      </div>
    );
  }

  if (!distance) return null;

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl px-4 py-2 border border-stone-200 dark:border-stone-700 inline-flex items-center gap-2">
      <Car className="h-4 w-4 text-park-forest" />
      <span className="text-sm text-stone-700 dark:text-stone-300">{distance.message}</span>
    </div>
  );
}