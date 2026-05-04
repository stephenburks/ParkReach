import { NextRequest, NextResponse } from 'next/server';
import { fetchPark } from '@/lib/nps';

function validateParkCode(parkCode: string): boolean {
  return /^[A-Z]{2,5}$/.test(parkCode);
}

function validateLat(lat: string): boolean {
  const num = parseFloat(lat);
  return !isNaN(num) && num >= -90 && num <= 90;
}

function validateLon(lon: string): boolean {
  const num = parseFloat(lon);
  return !isNaN(num) && num >= -180 && num <= 180;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ parkCode: string }> }
) {
  const { parkCode } = await params;
  const url = new URL(request.url);
  const userLat = url.searchParams.get('lat');
  const userLon = url.searchParams.get('lon');

  if (!validateParkCode(parkCode)) {
    return NextResponse.json(
      { error: 'Invalid park code. Must be 2-5 uppercase letters.' },
      { status: 400 }
    );
  }

  if (!userLat || !userLon) {
    return NextResponse.json(
      { error: 'Missing required query params: lat and lon.' },
      { status: 400 }
    );
  }

  if (!validateLat(userLat) || !validateLon(userLon)) {
    return NextResponse.json(
      { error: 'Invalid coordinates. lat must be -90 to 90, lon must be -180 to 180.' },
      { status: 400 }
    );
  }

  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!googleApiKey) {
    return NextResponse.json(
      { error: 'Distance service is not configured.' },
      { status: 503 }
    );
  }

  try {
    const park = await fetchPark(parkCode);
    if (!park || !park.latitude || !park.longitude) {
      return NextResponse.json(
        { error: 'Park not found or missing coordinates.' },
        { status: 404 }
      );
    }

    const destLat = parseFloat(park.latitude);
    const destLon = parseFloat(park.longitude);

    const distUrl = `https://maps.googleapis.com/maps/api/distancematrix/json` +
      `?origins=${userLat},${userLon}` +
      `&destinations=${destLat},${destLon}` +
      `&units=imperial` +
      `&key=${googleApiKey}`;

    const distRes = await fetch(distUrl, {
      next: { revalidate: 3600 },
    });

    if (!distRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch distance data.' },
        { status: 502 }
      );
    }

    const distData = await distRes.json();

    if (distData.status !== 'OK' || distData.rows?.[0]?.elements?.[0]?.status !== 'OK') {
      return NextResponse.json(
        { error: 'No route found between locations.' },
        { status: 404 }
      );
    }

    const element = distData.rows[0].elements[0];
    const drivingMiles = element.distance.value * 0.000621371;
    const drivingTime = element.duration.value;

    const hours = Math.floor(drivingTime / 3600);
    const minutes = Math.round((drivingTime % 3600) / 60);
    const message = hours > 0
      ? `${Math.round(drivingMiles)} miles, about ${hours} hr ${minutes} min drive`
      : `${Math.round(drivingMiles)} miles, about ${minutes} min drive`;

    return NextResponse.json({
      parkCode,
      drivingMiles: Math.round(drivingMiles * 10) / 10,
      drivingTime,
      message,
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to calculate distance.' },
      { status: 500 }
    );
  }
}
