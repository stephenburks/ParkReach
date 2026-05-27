/// <reference types="vitest/globals" />
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useAlerts } from '@/hooks/useAlerts'
import type { NpsAlert } from '@/types/alert'

const mockFetch = vi.fn()

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	})
	function TestWrapper({ children }: { children: React.ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	}
	return TestWrapper
}

function makeAlert(overrides: Partial<NpsAlert> = {}): NpsAlert {
	return {
		id: 'alert-1',
		url: '',
		title: 'Park Closure',
		parkCode: 'yose',
		description: 'The park is closed for maintenance',
		category: 'Park Closure',
		lastIndexedDate: '2024-01-01',
		...overrides,
	}
}

describe('useAlerts', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', mockFetch)
		mockFetch.mockReset()
	})

	it('returns alerts when API succeeds', async () => {
		const alert = makeAlert()

		mockFetch.mockResolvedValueOnce({
			ok: true,
			json: async () => ({ data: [alert] }),
		})

		const { result } = renderHook(() => useAlerts('yose'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false)
		})

		expect(result.current.data).toHaveLength(1)
		expect(result.current.data?.[0].id).toBe('alert-1')
		expect(result.current.data?.[0].category).toBe('Park Closure')
	})

	it('returns empty array when parkCode is empty', () => {
		const { result } = renderHook(() => useAlerts(''), {
			wrapper: createWrapper(),
		})

		// Query is disabled when parkCode is empty (Boolean('') === false)
		expect(result.current.isLoading).toBe(false)
		expect(result.current.data).toBeUndefined()
		// fetch should not be called since query is disabled
		expect(mockFetch).not.toHaveBeenCalled()
	})

	it('handles fetch error gracefully', async () => {
		mockFetch.mockRejectedValueOnce(new Error('Network error'))

		const { result } = renderHook(() => useAlerts('yose'), {
			wrapper: createWrapper(),
		})

		await waitFor(() => {
			expect(result.current.isError).toBe(true)
		})

		expect(result.current.error).toBeTruthy()
		expect(result.current.data).toBeUndefined()
	})
})
