'use client';

import { Car } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { DistanceData } from '@/types/distance';

interface Props {
  parkCode: string;
  latitude?: string;
  longitude?: string;
}

export function DistanceBadge({ parkCode, latitude, longitude }: Props) {
  const { data: distance, isLoading: loading } = useQuery({
    queryKey: ['distance', parkCode, latitude, longitude],
    queryFn: async () => {
      if (!latitude || !longitude) return null;
      const params = new URLSearchParams({ lat: latitude, lon: longitude });
      const res = await fetch(`/api/distance/${parkCode}?${params}`);
      if (!res.ok) throw new Error('Failed to fetch distance data');
      return res.json() as Promise<DistanceData>;
    },
    enabled: !!(latitude && longitude),
  });

  if (!latitude || !longitude) return null;

  if (loading) {
    return (
      <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 shadow-sm animate-pulse inline-flex items-center gap-2">
        <Car className="h-4 w-4" />
        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-20" />
      </div>
    );
  }

  if (!distance) return null;

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl px-4 py-2 border border-stone-200 dark:border-stone-700 shadow-sm inline-flex items-center gap-2">
      <Car className="h-4 w-4 text-park-forest" />
      <span className="text-sm text-stone-700 dark:text-stone-300">{distance.message}</span>
    </div>
  );
}
