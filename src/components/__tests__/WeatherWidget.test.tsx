/// <reference types="vitest/globals" />
import { render, screen, waitFor } from '@testing-library/react'
import { WeatherWidget } from '@/components/WeatherWidget'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock fetch globally
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function Wrapper({ children }: { children: React.ReactNode }) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	})
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

const mockWeatherData = {
	parkCode: 'yose',
	conditions: 'Sunny',
	temperature: '72°F',
	forecast: 'Clear skies all day with a high of 72.',
}

describe('WeatherWidget', () => {
	beforeEach(() => {
		mockFetch.mockReset()
	})

	it('renders loading skeleton initially', () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockWeatherData,
		})

		render(
			<Wrapper>
				<WeatherWidget parkCode="yose" />
			</Wrapper>,
		)

		expect(screen.getByLabelText('Loading weather')).toBeInTheDocument()
	})

	it('shows weather data when loaded', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockWeatherData,
		})

		render(
			<Wrapper>
				<WeatherWidget parkCode="yose" />
			</Wrapper>,
		)

		await waitFor(() => {
			expect(screen.getByText('Weather')).toBeInTheDocument()
		})

		expect(
			screen.getByText('Clear skies all day with a high of 72.'),
		).toBeInTheDocument()
	})

	it('shows weather unavailable when data is null/undefined', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => null,
		})

		render(
			<Wrapper>
				<WeatherWidget parkCode="yose" />
			</Wrapper>,
		)

		expect(
			await screen.findByText('Weather data unavailable'),
		).toBeInTheDocument()
	})

	it('handles fetch error gracefully', async () => {
		mockFetch.mockRejectedValueOnce(new Error('Network error'))

		render(
			<Wrapper>
				<WeatherWidget parkCode="yose" />
			</Wrapper>,
		)

		expect(
			await screen.findByText('Weather data unavailable'),
		).toBeInTheDocument()
	})

	it('handles non-ok response', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 500,
			json: async () => ({}),
		})

		render(
			<Wrapper>
				<WeatherWidget parkCode="yose" />
			</Wrapper>,
		)

		expect(
			await screen.findByText('Weather data unavailable'),
		).toBeInTheDocument()
	})

	it('calls correct API endpoint', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => mockWeatherData,
		})

		render(
			<Wrapper>
				<WeatherWidget parkCode="yose" />
			</Wrapper>,
		)

		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalledWith('/api/weather/yose')
		})
	})
})
