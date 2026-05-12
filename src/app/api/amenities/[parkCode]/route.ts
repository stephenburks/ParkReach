import { NextRequest, NextResponse } from 'next/server';
import { jsonError } from '@/lib/api-response';
import { isValidParkCode } from '@/lib/validate-park-code';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ parkCode: string }> }
) {
  const { parkCode } = await params;

  if (!isValidParkCode(parkCode)) {
    return jsonError('Invalid park code.', 400);
  }

  const apiKey = process.env.NPS_API_KEY;

  if (!apiKey) {
    return jsonError('NPS API key not configured.', 503);
  }

  try {
    const res = await fetch(
      `https://developer.nps.gov/api/v1/amenities/parksplaces?parkCode=${parkCode}`,
      {
        headers: { 'X-Api-Key': apiKey },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return jsonError('Failed to fetch amenities data.', res.status);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return jsonError('Failed to fetch amenities data.', 500);
  }
}