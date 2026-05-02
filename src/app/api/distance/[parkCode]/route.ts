import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ parkCode: string }> }) {
  const { parkCode } = await params;
  const url = new URL(request.url);
  const userLat = url.searchParams.get('lat');
  const userLon = url.searchParams.get('lon');

  // Placeholder - distance API needs real implementation
  // Could use Google Maps Distance Matrix API
  const distance = {
    parkCode,
    drivingMiles: null,
    drivingTime: null,
    message: 'Enter your location to calculate distance.',
  };

  if (userLat && userLon) {
    distance.message = 'Distance calculation requires Google Maps API key.';
  }

  return NextResponse.json(distance);
}