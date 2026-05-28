import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { fetchPark } from '@/lib/nps';
import { jsonError } from '@/lib/api-response';
import { isValidParkCode } from '@/lib/validate-park-code';
import { checkRateLimit } from '@/lib/rate-limit';
import type { NwsPoint, NwsForecast } from '@/types/weather';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ parkCode: string }> }
) {
  const { parkCode } = await params;

  if (!isValidParkCode(parkCode)) {
    return jsonError('Invalid park code.', 400);
  }

  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? 'unknown';
	const { allowed } = await checkRateLimit(ip, 30, 60_000);
  if (!allowed) {
    return jsonError('Too many requests — please wait a moment.', 429);
  }

  try {
    const park = await fetchPark(parkCode);
    if (!park || !park.latitude || !park.longitude) {
      return jsonError('Park not found or missing coordinates.', 404);
    }

    const lat = parseFloat(park.latitude);
    const lon = parseFloat(park.longitude);

    const pointRes = await fetch(
      `https://api.weather.gov/points/${lat},${lon}`,
      {
        headers: { 'Accept': 'application/geo+json' },
        next: { revalidate: 3600 },
      }
    );

    if (!pointRes.ok) {
      return jsonError('Weather data unavailable for this location.', 502);
    }

    const pointData: NwsPoint = await pointRes.json();
    const forecastUrl = pointData.properties.forecast;

    const forecastRes = await fetch(forecastUrl, {
      headers: { 'Accept': 'application/geo+json' },
      next: { revalidate: 3600 },
    });

    if (!forecastRes.ok) {
      return jsonError('Failed to fetch weather forecast.', 502);
    }

    const forecastData: NwsForecast = await forecastRes.json();
    const periods = forecastData.properties.periods;
    const currentPeriod = periods[0];

    return NextResponse.json(
      {
        parkCode,
        conditions: currentPeriod.shortForecast,
        temperature: currentPeriod.temperature,
        forecast: currentPeriod.detailedForecast,
      },
      { status: 200 }
    );
  } catch {
    return jsonError('Failed to fetch weather data.', 500);
  }
}
