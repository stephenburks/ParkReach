import { NextRequest, NextResponse } from 'next/server';

const NPS_BASE = 'https://developer.nps.gov/api/v1';

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const q = sp.get('q') || '';
  const stateCode = sp.get('stateCode') || '';
  const designation = sp.get('designation') || '';
  const limit = sp.get('limit') || '50';
  const start = sp.get('start') || '0';

  const params = new URLSearchParams({
    api_key: process.env.NPS_API_KEY!,
    limit,
    start,
  });
  if (q) params.set('q', q);
  if (stateCode) params.set('stateCode', stateCode);
  if (designation) params.set('designation', designation);

  try {
    const res = await fetch(`${NPS_BASE}/parks?${params}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'NPS API error' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch parks' }, { status: 500 });
  }
}
