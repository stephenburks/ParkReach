/// <reference types="vitest/globals" />
/**
 * Accessibility audit tests using axe-core.
 * These run in jsdom so color-contrast checks are skipped (no computed styles),
 * but all ARIA and label-association rules are enforced.
 */
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import axe from 'axe-core'
import ParkCard from '../ParkCard'
import ParkCardMinimal from '../ParkCardMinimal'
import SearchFilter from '../SearchFilter'
import { ViewToggle } from '../ViewToggle'
import { Campgrounds } from '../Campgrounds'
import { VisitorCenters } from '../VisitorCenters'
import { UpcomingEvents } from '../UpcomingEvents'
import type { Park } from '@/types/park'
import type { NpsCampground } from '@/types/campground'
import type { NpsVisitorCenter } from '@/types/visitorCenter'
import type { NpsEvent } from '@/types/event'

vi.mock('@tanstack/react-query', async () => {
	const actual = await vi.importActual('@tanstack/react-query')
	return { ...actual, useQuery: vi.fn().mockReturnValue({ data: undefined, isLoading: false, isError: false }) }
})

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

const mockCampgrounds: NpsCampground[] = [
	{
		id: 'cg-1',
		url: 'https://example.com/cg1',
		name: 'Upper Pines',
		parkCode: 'yose',
		description: 'A popular campground in Yosemite Valley',
		numberOfSitesReservable: '100',
		numberOfSitesFirstComeFirstServe: '40',
		reservationUrl: 'https://recreation.gov',
		accessibility: {
			wheelchairAccess: 'Accessible campsites available',
			fireStovePolicy: '',
			rVAllowed: '',
			rVInfo: '',
			additionalInfo: 'Some sites have accessible picnic tables',
			numberOfSitesReservable: '',
		},
		amenities: {
			trashRecyclingCollection: '',
			toilets: [],
			internetConnectivity: '',
			showers: [],
			cellPhoneReception: '',
			laundry: '',
			amphitheater: '',
			dumpStation: '',
			campStore: '',
			staffOrVolunteerHostOnsite: '',
			potableWater: [],
			iceAvailableForSale: '',
			firewoodForSale: '',
			foodStorageLockers: '',
		},
		directionsOverview: 'Located in Yosemite Valley',
		directionsUrl: '',
		images: [],
		latitude: '37.74',
		longitude: '-119.56',
	},
]

const mockVisitorCenters: NpsVisitorCenter[] = [
	{
		id: 'vc-1',
		url: 'https://example.com/vc1',
		name: 'Yosemite Valley Visitor Center',
		parkCode: 'yose',
		description: 'Main visitor center with exhibits and information',
		directionsInfo: 'Located in Yosemite Village',
		directionsUrl: 'https://maps.example.com',
		operatingHours: [
			{
				name: 'Standard Hours',
				description: 'Year-round',
				standardHours: {
					sunday: '9:00AM - 5:00PM',
					monday: '9:00AM - 5:00PM',
					tuesday: '9:00AM - 5:00PM',
					wednesday: '9:00AM - 5:00PM',
					thursday: '9:00AM - 5:00PM',
					friday: '9:00AM - 5:00PM',
					saturday: '9:00AM - 5:00PM',
				},
				exceptions: [],
			},
		],
		addresses: [],
		images: [],
		latitude: '37.74',
		longitude: '-119.58',
	},
]

const mockEvents: NpsEvent[] = [
	{
		id: 'evt-1',
		url: 'https://example.com/evt1',
		title: 'Stargazing Program',
		description: 'Join rangers for an evening of stargazing in Yosemite Valley',
		datestart: '2026-06-15',
		dateend: '2026-06-15',
		times: [{ datestart: '8:30PM', dateend: '10:00PM', recurrencerule: '', sunrisetime: '', sunsettime: '', isallday: 'false', isbeginningunknown: 'false', isendunknown: 'false' }],
		category: 'Astronomy',
		feeinfo: 'Free',
		isrecurring: 'false',
		contacttelephonenumber: '',
		contactemailaddress: '',
		isregresrequired: 'false',
		location: 'Glacier Point',
		types: [],
		images: [],
		parkCode: 'yose',
	},
]

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

describe('Accessibility — Campgrounds', () => {
	it('has no axe violations with data', async () => {
		vi.mocked(useQuery).mockReturnValue({
			data: mockCampgrounds,
			isLoading: false,
			isError: false,
			// Include commonly destructured properties
			dataUpdatedAt: 0,
			error: null,
			errorUpdatedAt: 0,
			failureCount: 0,
			failureReason: null,
			fetchStatus: 'idle',
			isFetched: true,
			isFetchedAfterMount: true,
			isFetching: false,
			isPaused: false,
			isPending: false,
			isRefetching: false,
			isStale: false,
			isSuccess: true,
			refetch: vi.fn(),
			remove: vi.fn(),
			status: 'success',
		} as unknown as ReturnType<typeof useQuery<NpsCampground[]>>)

		const { container } = render(<Campgrounds parkCode="yose" />)
		expect(await getViolations(container)).toHaveLength(0)
	})
})

describe('Accessibility — VisitorCenters', () => {
	it('has no axe violations with data', async () => {
		vi.mocked(useQuery).mockReturnValue({
			data: mockVisitorCenters,
			isLoading: false,
			isError: false,
			dataUpdatedAt: 0,
			error: null,
			errorUpdatedAt: 0,
			failureCount: 0,
			failureReason: null,
			fetchStatus: 'idle',
			isFetched: true,
			isFetchedAfterMount: true,
			isFetching: false,
			isPaused: false,
			isPending: false,
			isRefetching: false,
			isStale: false,
			isSuccess: true,
			refetch: vi.fn(),
			remove: vi.fn(),
			status: 'success',
		} as unknown as ReturnType<typeof useQuery<NpsVisitorCenter[]>>)

		const { container } = render(<VisitorCenters parkCode="yose" />)
		expect(await getViolations(container)).toHaveLength(0)
	})
})

describe('Accessibility — UpcomingEvents', () => {
	it('has no axe violations with data', async () => {
		vi.mocked(useQuery).mockReturnValue({
			data: mockEvents,
			isLoading: false,
			isError: false,
			dataUpdatedAt: 0,
			error: null,
			errorUpdatedAt: 0,
			failureCount: 0,
			failureReason: null,
			fetchStatus: 'idle',
			isFetched: true,
			isFetchedAfterMount: true,
			isFetching: false,
			isPaused: false,
			isPending: false,
			isRefetching: false,
			isStale: false,
			isSuccess: true,
			refetch: vi.fn(),
			remove: vi.fn(),
			status: 'success',
		} as unknown as ReturnType<typeof useQuery<NpsEvent[]>>)

		const { container } = render(<UpcomingEvents parkCode="yose" />)
		expect(await getViolations(container)).toHaveLength(0)
	})
})
