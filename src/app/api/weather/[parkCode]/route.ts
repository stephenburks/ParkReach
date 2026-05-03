import { NextRequest, NextResponse } from 'next/server';

interface NpsPark {
  parkCode: string;
  latitude: string;
  longitude: string;
}

interface NwsPoint {
  properties: {
    forecast: string;
  };
}

interface NwsForecastPeriod {
  name: string;
  temperature: number;
  shortForecast: string;
  detailedForecast: string;
}

interface NwsForecast {
  properties: {
    periods: NwsForecastPeriod[];
  };
}

function validateParkCode(parkCode: string): boolean {
  return /^[A-Z]{2,5}$/.test(parkCode);
}

async function fetchParkFromNps(parkCode: string): Promise<NpsPark | null> {
  const apiKey = process.env.NPS_API_KEY;
  if (!apiKey) return null;

  const res = await fetch(
    `https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}`,
    {
      headers: { 'X-Api-Key': apiKey },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.data?.[0] || null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ parkCode: string }> }
) {
  const { parkCode } = await params;

  if (!validateParkCode(parkCode)) {
    return NextResponse.json(
      { error: 'Invalid park code. Must be 2-5 uppercase letters.' },
      { status: 400 }
    );
  }

  try {
    const park = await fetchParkFromNps(parkCode);
    if (!park || !park.latitude || !park.longitude) {
      return NextResponse.json(
        { error: 'Park not found or missing coordinates.' },
        { status: 404 }
      );
    }

    const lat = parseFloat(park.latitude);
    const lon = parseFloat(park.longitude);

    // Step 1: Get NWS point data to find the forecast URL
    const pointRes = await fetch(
      `https://api.weather.gov/points/${lat},${lon}`,
      {
        headers: { 'Accept': 'application/geo+json' },
        next: { revalidate: 3600 },
      }
    );

    if (!pointRes.ok) {
      return NextResponse.json(
        { error: 'Weather data unavailable for this location.' },
        { status: 502 }
      );
    }

    const pointData: NwsPoint = await pointRes.json();
    const forecastUrl = pointData.properties.forecast;

    // Step 2: Fetch the actual forecast
    const forecastRes = await fetch(forecastUrl, {
      headers: { 'Accept': 'application/geo+json' },
      next: { revalidate: 3600 },
    });

    if (!forecastRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch weather forecast.' },
        { status: 502 }
      );
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
    return NextResponse.json(
      { error: 'Failed to fetch weather data.' },
      { status: 500 }
    );
  }
}
