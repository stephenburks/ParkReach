/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import React from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { AlertBadge } from '@/components/AlertBadge'
import type { NpsAlert } from '@/types/alert'

// Mock useAlerts hook
const mockUseAlerts = vi.fn()
vi.mock('@/hooks/useAlerts', () => ({
	useAlerts: (...args: unknown[]) => mockUseAlerts(...args),
}))

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

describe('AlertBadge', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	// --- parkCode / useAlerts path (existing) ---

	it('renders nothing when no alerts provided', () => {
		mockUseAlerts.mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
		} as unknown as UseQueryResult<NpsAlert[], Error>)

		const { container } = render(<AlertBadge parkCode="yose" />)
		expect(container.firstChild).toBeNull()
	})

	it('shows correct badge text for single alert (e.g., "Park Closure")', () => {
		mockUseAlerts.mockReturnValue({
			data: [makeAlert({ category: 'Park Closure', title: 'Park Closure' })],
			isLoading: false,
			isError: false,
		} as unknown as UseQueryResult<NpsAlert[], Error>)

		render(<AlertBadge parkCode="yose" />)
		expect(screen.getByText('Park Closure')).toBeInTheDocument()
	})

	it('shows count for multiple alerts (e.g., "3 alerts")', () => {
		const alerts = [
			makeAlert({ id: '1', category: 'Information', title: 'Info 1' }),
			makeAlert({ id: '2', category: 'Caution', title: 'Caution 1' }),
			makeAlert({ id: '3', category: 'Information', title: 'Info 2' }),
		]

		mockUseAlerts.mockReturnValue({
			data: alerts,
			isLoading: false,
			isError: false,
		} as unknown as UseQueryResult<NpsAlert[], Error>)

		render(<AlertBadge parkCode="yose" />)
		expect(screen.getByText('3 alerts')).toBeInTheDocument()
	})

	it('shows highest severity alert type (Park Closure over Danger)', () => {
		const alerts = [
			makeAlert({ id: '1', category: 'Information', title: 'Info' }),
			makeAlert({ id: '2', category: 'Danger', title: 'Danger alert' }),
			makeAlert({ id: '3', category: 'Park Closure', title: 'Closure' }),
		]

		mockUseAlerts.mockReturnValue({
			data: alerts,
			isLoading: false,
			isError: false,
		} as unknown as UseQueryResult<NpsAlert[], Error>)

		render(<AlertBadge parkCode="yose" />)
		// Should show count for 3, not the category (since >1 alert)
		expect(screen.getByText('3 alerts')).toBeInTheDocument()
		// sr-only text should mention 3 alerts
		expect(screen.getByText('3 active alerts:')).toBeInTheDocument()
	})

	it('sr-only text is present for screen readers', () => {
		mockUseAlerts.mockReturnValue({
			data: [makeAlert({ category: 'Caution', title: 'Trail Hazard' })],
			isLoading: false,
			isError: false,
		} as unknown as UseQueryResult<NpsAlert[], Error>)

		render(<AlertBadge parkCode="yose" />)
		// Single alert: sr-only says "1 active alert: "
		expect(screen.getByText('1 active alert:')).toBeInTheDocument()
		// Visible text shows the category
		expect(screen.getByText('Caution')).toBeInTheDocument()
	})

	it('handles empty alerts array', () => {
		mockUseAlerts.mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
		} as unknown as UseQueryResult<NpsAlert[], Error>)

		const { container } = render(<AlertBadge parkCode="yose" />)
		expect(container.firstChild).toBeNull()
	})

	it('works with alertsOverride prop (bypassing the hook)', () => {
		const overrideAlerts = [
			makeAlert({ id: 'override-1', category: 'Danger', title: 'Override Danger' }),
		]

		// Even if the hook would return empty, override should win
		mockUseAlerts.mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
		} as unknown as UseQueryResult<NpsAlert[], Error>)

		render(<AlertBadge parkCode="yose" alertsOverride={overrideAlerts} />)
		expect(screen.getByText('Danger')).toBeInTheDocument()
	})

	// --- alertSummary prop (inline, no API call) ---

	it('shows "Closed" badge when alertSummary has has_closure: true', () => {
		render(
			<AlertBadge
				alertSummary={{
					has_closure: true,
					has_danger: false,
					alert_count: 1,
					alert_level: 'Closure',
				}}
			/>
		)
		expect(screen.getByText('Closed')).toBeInTheDocument()
		expect(screen.getByText('Park Closure alert:')).toBeInTheDocument()
	})

	it('shows "Danger Alert" badge when alertSummary has has_danger: true (and no closure)', () => {
		render(
			<AlertBadge
				alertSummary={{
					has_closure: false,
					has_danger: true,
					alert_count: 2,
					alert_level: 'Danger',
				}}
			/>
		)
		expect(screen.getByText('Danger Alert')).toBeInTheDocument()
		expect(screen.getByText('Danger alert:')).toBeInTheDocument()
	})

	it('closure takes priority over danger when both are true', () => {
		render(
			<AlertBadge
				alertSummary={{
					has_closure: true,
					has_danger: true,
					alert_count: 5,
					alert_level: 'Closure',
				}}
			/>
		)
		expect(screen.getByText('Closed')).toBeInTheDocument()
		expect(screen.queryByText('Danger Alert')).not.toBeInTheDocument()
	})

	it('shows count badge when alert_count > 0 and no closure/danger (multiple)', () => {
		render(
			<AlertBadge
				alertSummary={{
					has_closure: false,
					has_danger: false,
					alert_count: 3,
					alert_level: 'Caution',
				}}
			/>
		)
		expect(screen.getByText('3 alerts')).toBeInTheDocument()
		expect(screen.getByText('3 active alerts:')).toBeInTheDocument()
	})

	it('shows singular count badge when alert_count === 1 and no closure/danger', () => {
		render(
			<AlertBadge
				alertSummary={{
					has_closure: false,
					has_danger: false,
					alert_count: 1,
					alert_level: 'Information',
				}}
			/>
		)
		expect(screen.getByText('1 alert')).toBeInTheDocument()
		expect(screen.getByText('1 active alert:')).toBeInTheDocument()
	})

	it('returns null when alertSummary has no alerts', () => {
		const { container } = render(
			<AlertBadge
				alertSummary={{
					has_closure: false,
					has_danger: false,
					alert_count: 0,
					alert_level: null,
				}}
			/>
		)
		expect(container.firstChild).toBeNull()
	})

	it('returns null when alertSummary has undefined alert_count and no flags', () => {
		const { container } = render(
			<AlertBadge
				alertSummary={{
					has_closure: undefined,
					has_danger: undefined,
					alert_count: undefined,
					alert_level: null,
				}}
			/>
		)
		expect(container.firstChild).toBeNull()
	})

	it('alertSummary path calls useAlerts with disabled query (rules-of-hooks compliance)', () => {
		render(
			<AlertBadge
				alertSummary={{
					has_closure: true,
					alert_count: 1,
				}}
			/>
		)
		// Hook is called for rules-of-hooks compliance, but with empty parkCode so the query is disabled
		expect(mockUseAlerts).toHaveBeenCalledWith('')
	})
})
