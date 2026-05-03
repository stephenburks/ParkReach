import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ parkCode: string }> }
) {
  const { parkCode } = await params;
  const apiKey = process.env.NPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'NPS API key not configured' }, { status: 500 });
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
      return NextResponse.json(
        { error: 'Failed to fetch amenities data' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch amenities data' },
      { status: 500 }
    );
  }
}