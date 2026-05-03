import { NextRequest } from 'next/server'
import { GET } from '../route'

function makeRequest(path: string): NextRequest {
	return new NextRequest(`http://localhost:3000${path}`)
}

const mockParksResponse = {
	data: [
		{
			id: '1',
			parkCode: 'yose',
			fullName: 'Yosemite National Park',
			designation: 'National Park',
		},
	],
	total: '1',
	limit: '24',
	start: '0',
}

beforeEach(() => {
	vi.stubEnv('NPS_API_KEY', 'test-key')
})

afterEach(() => {
	vi.unstubAllEnvs()
	vi.restoreAllMocks()
})

describe('GET /api/parks', () => {
	it('proxies a successful NPS response', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response(JSON.stringify(mockParksResponse), { status: 200 }),
		)

		const response = await GET(makeRequest('/api/parks?limit=24&start=0'))
		const body = await response.json()

		expect(response.status).toBe(200)
		expect(body.data).toHaveLength(1)
		expect(body.data[0].parkCode).toBe('yose')
	})

	it('forwards query params to NPS API', async () => {
		const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response(JSON.stringify(mockParksResponse), { status: 200 }),
		)

		await GET(makeRequest('/api/parks?q=yosemite&stateCode=CA&limit=10&start=0'))

		const calledUrl = fetchSpy.mock.calls[0][0] as string
		expect(calledUrl).toContain('q=yosemite')
		expect(calledUrl).toContain('stateCode=CA')
		expect(calledUrl).toContain('limit=10')
	})

	it('passes the NPS API key as a header', async () => {
		const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response(JSON.stringify(mockParksResponse), { status: 200 }),
		)

		await GET(makeRequest('/api/parks'))

		const calledInit = fetchSpy.mock.calls[0][1] as RequestInit
		expect((calledInit.headers as Record<string, string>)['X-Api-Key']).toBe('test-key')
	})

	it('returns an error when NPS API responds with non-200', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response('Not Found', { status: 404 }),
		)

		const response = await GET(makeRequest('/api/parks'))
		expect(response.status).toBe(404)
		const body = await response.json()
		expect(body.error).toBe('NPS API error')
	})

	it('returns 400 when NPS API returns an error field', async () => {
		vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
			new Response(JSON.stringify({ error: 'Invalid API key' }), { status: 200 }),
		)

		const response = await GET(makeRequest('/api/parks'))
		expect(response.status).toBe(400)
		const body = await response.json()
		expect(body.error).toBe('Invalid API key')
	})

	it('returns 500 on network failure', async () => {
		vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))

		const response = await GET(makeRequest('/api/parks'))
		expect(response.status).toBe(500)
		const body = await response.json()
		expect(body.error).toBe('Failed to fetch parks')
	})
})
