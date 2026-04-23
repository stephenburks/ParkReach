import { NextRequest, NextResponse } from 'next/server';
import https from 'node:https';

const NPS_HOST = 'developer.nps.gov';

// Use node:https directly so we can set rejectUnauthorized: false,
// working around corporate SSL inspection proxies that Undici/fetch rejects.
function npsGet(path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: NPS_HOST, path, method: 'GET', rejectUnauthorized: false },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        res.on('error', reject);
      }
    );
    req.on('error', reject);
    req.end();
  });
}

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
    const body = await npsGet(`/api/v1/parks?${params}`);
    const data = JSON.parse(body);
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (e) {
    console.error('[/api/parks] error:', e);
    return NextResponse.json({ error: 'Failed to fetch parks' }, { status: 500 });
  }
}
