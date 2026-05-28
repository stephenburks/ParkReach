'use client';

import { CloudSun } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { WeatherData } from '@/types/weather';

interface Props {
  parkCode: string;
}

export function WeatherWidget({ parkCode }: Props) {
  const { data: weather, isLoading: loading } = useQuery({
    queryKey: ['weather', parkCode],
    queryFn: async () => {
      const res = await fetch(`/api/weather/${parkCode}`);
      if (!res.ok) throw new Error('Failed to fetch weather data');
      return res.json() as Promise<WeatherData>;
    },
  });

  if (loading) {
    return (
      <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 shadow-sm animate-pulse">
        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-24 mb-3" />
        <div className="h-6 bg-stone-200 dark:bg-stone-700 rounded w-32" />
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <CloudSun className="h-5 w-5 text-park-forest" />
        <h3 className="font-semibold text-park-bark dark:text-park-cream">Weather</h3>
      </div>
      <p className="text-stone-700 dark:text-stone-300 text-sm">{weather.forecast}</p>
    </div>
  );
}
