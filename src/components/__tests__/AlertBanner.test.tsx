/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { AlertBanner } from '@/components/AlertBanner'
import type { NpsAlert } from '@/types/alert'

// Mock useAlerts hook
const mockUseAlerts = vi.fn()
vi.mock('@/hooks/useAlerts', () => ({
	useAlerts: (...args: unknown[]) => mockUseAlerts(...args),
}))

// Mock lucide-react X icon
vi.mock('lucide-react', () => ({
	X: (props: React.SVGProps<SVGSVGElement>) => React.createElement('svg', props),
}))

function makeAlert(overrides: Partial<NpsAlert> = {}): NpsAlert {
	return {
		id: 'alert-1',
		url: '',
		title: 'Trail Closure',
		parkCode: 'yose',
		description: 'Mist Trail is closed for repairs',
		category: 'Caution',
		lastIndexedDate: '2024-01-01',
		...overrides,
	}
}

describe('AlertBanner', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('renders nothing when no alerts', () => {
		mockUseAlerts.mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
		} as unknown as UseQueryResult<NpsAlert[], Error>)

		const { container } = render(<AlertBanner parkCode="yose" />)
		expect(container.firstChild).toBeNull()
	})

	it('renders alert cards with correct styling', () => {
		const alert = makeAlert({
			category: 'Caution',
			title: 'Trail Hazard',
			description: 'Watch for falling rocks',
		})

		mockUseAlerts.mockReturnValue({
			data: [alert],
			isLoading: false,
			isError: false,
		} as unknown as UseQueryResult<NpsAlert[], Error>)

		render(<AlertBanner parkCode="yose" />)

		const region = screen.getByRole('alert')
		expect(region).toBeInTheDocument()
		expect(region).toHaveClass('border-amber-500')
		expect(screen.getByText('Trail Hazard')).toBeInTheDocument()
		expect(screen.getByText('Watch for falling rocks')).toBeInTheDocument()
	})

	it('dismiss button removes the alert from view', async () => {
		const user = userEvent.setup()
		const alert = makeAlert({ id: 'dismissible', title: 'Closable Alert' })

		mockUseAlerts.mockReturnValue({
			data: [alert],
			isLoading: false,
			isError: false,
		} as unknown as UseQueryResult<NpsAlert[], Error>)

		render(<AlertBanner parkCode="yose" />)

		expect(screen.getByText('Closable Alert')).toBeInTheDocument()

		const dismissButton = screen.getByRole('button', { name: /dismiss alert/i })
		await user.click(dismissButton)

		// After dismiss, the alert should be gone and the banner should render nothing
		expect(screen.queryByText('Closable Alert')).not.toBeInTheDocument()
	})

	it('dismiss button has proper aria-label', () => {
		const alert = makeAlert({ title: 'Park Closure Due to Weather' })

		mockUseAlerts.mockReturnValue({
			data: [alert],
			isLoading: false,
			isError: false,
		} as unknown as UseQueryResult<NpsAlert[], Error>)

		render(<AlertBanner parkCode="yose" />)

		const dismissButton = screen.getByRole('button', {
			name: 'Dismiss alert: Park Closure Due to Weather',
		})
		expect(dismissButton).toBeInTheDocument()
	})

	it('shows "More information" link when alert has a URL', () => {
		const alert = makeAlert({
			title: 'Road Closure',
			url: 'https://nps.gov/yose/alerts/road-closure',
		})

		mockUseAlerts.mockReturnValue({
			data: [alert],
			isLoading: false,
			isError: false,
		} as unknown as UseQueryResult<NpsAlert[], Error>)

		render(<AlertBanner parkCode="yose" />)

		const link = screen.getByRole('link', { name: 'More information' })
		expect(link).toBeInTheDocument()
		expect(link).toHaveAttribute('href', 'https://nps.gov/yose/alerts/road-closure')
	})

	it('does not show "More information" link when alert has no URL', () => {
		const alert = makeAlert({ url: '' })

		mockUseAlerts.mockReturnValue({
			data: [alert],
			isLoading: false,
			isError: false,
		} as unknown as UseQueryResult<NpsAlert[], Error>)

		render(<AlertBanner parkCode="yose" />)

		expect(screen.queryByRole('link')).not.toBeInTheDocument()
	})
})
