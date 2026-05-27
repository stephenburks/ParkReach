/// <reference types="vitest/globals" />
/**
 * Accessibility audit tests using axe-core.
 * These run in jsdom so color-contrast checks are skipped (no computed styles),
 * but all ARIA and label-association rules are enforced.
 */
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axe from 'axe-core'
import ParkCard from '../ParkCard'
import ParkCardMinimal from '../ParkCardMinimal'
import SearchFilter from '../SearchFilter'
import { ViewToggle } from '../ViewToggle'
import type { Park } from '@/types/park'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
function Wrapper({ children }: { children: React.ReactNode }) {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

const AXE_OPTIONS: axe.RunOptions = {
	rules: {
		// Color contrast can't be checked in jsdom (no computed styles)
		'color-contrast': { enabled: false },
	},
}

async function getViolations(container: HTMLElement) {
	const results = await axe.run(container, AXE_OPTIONS)
	return results.violations
}

const mockPark: Park = {
	id: '1',
	name: 'Yosemite',
	fullName: 'Yosemite National Park',
	parkCode: 'yose',
	description: 'A beautiful park in California',
	designation: 'National Park',
	states: 'CA',
	url: 'https://www.nps.gov/yose',
	latitude: '37.8651',
	longitude: '-119.5383',
	activities: [],
	topics: [],
	entranceFees: [],
	entrancePasses: [],
	operatingHours: [],
	images: [{ url: 'https://example.com/img.jpg', altText: 'Yosemite valley', title: '', credit: '', caption: '' }],
	weatherInfo: '',
	directionsInfo: '',
	directionsUrl: '',
}

describe('Accessibility — ParkCard', () => {
	it('has no axe violations', async () => {
		const { container } = render(<ParkCard park={mockPark} onSelect={() => {}} />, { wrapper: Wrapper })
		expect(await getViolations(container)).toHaveLength(0)
	})
})

describe('Accessibility — ParkCardMinimal', () => {
	it('has no axe violations', async () => {
		const { container } = render(<ParkCardMinimal park={mockPark} onSelect={() => {}} />, { wrapper: Wrapper })
		expect(await getViolations(container)).toHaveLength(0)
	})
})

describe('Accessibility — SearchFilter', () => {
	const defaultProps = {
		search: '',
		onSearchChange: () => {},
		stateCode: '',
		onStateChange: () => {},
		designation: 'All',
		onDesignationChange: () => {},
		designations: ['All', 'National Park'],
	}

	it('has no axe violations with default state', async () => {
		const { container } = render(<SearchFilter {...defaultProps} />)
		const violations = await getViolations(container)
		expect(violations).toHaveLength(0)
	})

	it('has no axe violations with active designation filter', async () => {
		const { container } = render(
			<SearchFilter {...defaultProps} designation="National Parks" />,
		)
		expect(await getViolations(container)).toHaveLength(0)
	})
})

describe('Accessibility — ViewToggle', () => {
	it('has no axe violations in cards mode', async () => {
		const { container } = render(<ViewToggle view="cards" onChange={() => {}} />)
		expect(await getViolations(container)).toHaveLength(0)
	})

	it('has no axe violations in minimal mode', async () => {
		const { container } = render(<ViewToggle view="minimal" onChange={() => {}} />)
		expect(await getViolations(container)).toHaveLength(0)
	})
})
