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
import ParkModal from '../ParkModal'
import { AuthModal } from '../AuthModal'
import { WeatherWidget } from '../WeatherWidget'
import { AlertBanner } from '../AlertBanner'
import type { Park } from '@/types/park'
import type { NpsCampground } from '@/types/campground'
import type { NpsVisitorCenter } from '@/types/visitorCenter'
import type { NpsEvent } from '@/types/event'
// import type { NpsAlert } from '@/types/alert'

vi.mock('@tanstack/react-query', async () => {
	const actual = await vi.importActual('@tanstack/react-query')
	return { ...actual, useQuery: vi.fn().mockReturnValue({ data: undefined, isLoading: false, isError: false }) }
})

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
function Wrapper({ children }: { children: React.ReactNode }) {
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

// Mocks for ParkModal child components
// Buttons are disabled by default (matches real behavior when loading=true from SavesContext)
vi.mock('../WishlistButton', () => ({
	WishlistButton: ({ parkCode }: { parkCode?: string }) => (
		<button data-testid="wishlist-btn" disabled>Wishlist {parkCode}</button>
	),
}))
vi.mock('../VisitedButton', () => ({
	VisitedButton: ({ parkCode }: { parkCode?: string }) => (
		<button data-testid="visited-btn" disabled>Visited {parkCode}</button>
	),
}))
vi.mock('../AddToTripButton', () => ({
	AddToTripButton: ({ parkCode }: { parkCode?: string }) => (
		<button data-testid="add-to-trip-btn">Add to Trip {parkCode}</button>
	),
}))
vi.mock('../WeatherWidget', () => ({
	WeatherWidget: ({ parkCode }: { parkCode?: string }) => (
		<div data-testid="weather-widget">Weather for {parkCode}</div>
	),
}))
vi.mock('../DistanceBadge', () => ({
	DistanceBadge: ({ parkCode }: { parkCode?: string }) => (
		<div data-testid="distance-badge">Distance for {parkCode}</div>
	),
}))
vi.mock('@/hooks/useFocusTrap', () => ({ useFocusTrap: () => {} }))

// Mock useParkEnrichment to use the park prop directly
vi.mock('@/hooks/useParks', async () => {
	const actual = await vi.importActual('@/hooks/useParks')
	return {
		...actual,
		useParkEnrichment: () => ({ data: null, isLoading: false, isError: false }),
	}
})

// Mocks for AuthModal
vi.mock('../MagicLinkForm', () => ({
	MagicLinkForm: ({ onSent, inputId }: { onSent: (email: string) => void; inputId?: string }) => (
		<form
			data-testid="magic-link-form"
			onSubmit={(e) => { e.preventDefault(); onSent('test@example.com') }}
		>
			<label htmlFor={inputId}>Email address</label>
			<input id={inputId} />
			<button type="submit">Send Email Code</button>
		</form>
	),
}))
vi.mock('@/context/AuthContext', () => ({
	useAuth: () => ({ supabase: {}, user: null, loading: false }),
}))

// Mock for AlertBanner / AlertBadge — default to empty alerts
const mockUseAlerts = vi.fn().mockReturnValue({ data: [], isLoading: false, isError: false })
vi.mock('@/hooks/useAlerts', () => ({
	useAlerts: (...args: unknown[]) => mockUseAlerts(...args),
}))

// Mock next/image and next/link
vi.mock('next/image', () => ({
	default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean; sizes?: string }) => {
		const { fill: _fill, priority: _priority, sizes: _sizes, ...rest } = props
		return <img {...rest} alt={props.alt} />
	},
}))
vi.mock('next/link', () => ({
	default: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
		<a href={href}>{children}</a>
	),
}))

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
		a11yFilters: { hasWheelchair: false, hasBraille: false, hasAsl: false, hasAudioDescription: false },
		onA11yFilterChange: () => {},
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

// Full park data for ParkModal a11y test
const fullPark: Park = {
	id: 'yose',
	parkCode: 'yose',
	fullName: 'Yosemite National Park',
	name: 'Yosemite',
	description: 'A beautiful park in California.',
	states: 'CA',
	designation: 'National Park',
	latitude: '37.8651',
	longitude: '-119.5383',
	url: 'https://www.nps.gov/yose/index.htm',
	activities: [
		{ id: '1', name: 'Hiking' },
		{ id: '2', name: 'Camping' },
	],
	topics: [],
	entranceFees: [
		{ title: 'Vehicle', description: 'Per vehicle', cost: '35.00' },
	],
	entrancePasses: [],
	operatingHours: [
		{
			name: 'Yosemite',
			description: 'Open daily',
			standardHours: {
				sunday: '24/7', monday: '24/7', tuesday: '24/7', wednesday: '24/7',
				thursday: '24/7', friday: '24/7', saturday: '24/7',
			},
			exceptions: [],
		},
	],
	images: [],
	weatherInfo: 'Weather varies by elevation.',
	directionsInfo: '',
	directionsUrl: '',
}

describe('Accessibility — ParkModal', () => {
	it('has no axe violations with full park data', async () => {
		const { container } = render(<ParkModal park={fullPark} onClose={() => {}} />)
		expect(await getViolations(container)).toHaveLength(0)
	})

	it('has no axe violations with minimal park data', async () => {
		const minimalPark: Park = {
			id: 'min',
			parkCode: 'min',
			fullName: 'Minimal Park',
			name: 'Minimal',
			description: '',
			states: '',
			designation: '',
			latitude: '0',
			longitude: '0',
			url: '',
			activities: [],
			topics: [],
			entranceFees: [],
			entrancePasses: [],
			operatingHours: [],
			images: [],
			weatherInfo: '',
			directionsInfo: '',
			directionsUrl: '',
		}
		const { container } = render(<ParkModal park={minimalPark} onClose={() => {}} />)
		expect(await getViolations(container)).toHaveLength(0)
	})
})

describe('Accessibility — AuthModal', () => {
	it('has no axe violations when open', async () => {
		Object.defineProperty(document.body, 'style', { value: { overflow: '' }, writable: true })
		const { container } = render(<AuthModal isOpen={true} onClose={() => {}} />)
		expect(await getViolations(container)).toHaveLength(0)
	})
})

describe('Accessibility — WeatherWidget', () => {
	it('has no axe violations in loading state', async () => {
		vi.mocked(useQuery).mockReturnValue({
			data: undefined,
			isLoading: true,
			isError: false,
			dataUpdatedAt: 0,
			error: null,
			errorUpdatedAt: 0,
			failureCount: 0,
			failureReason: null,
			fetchStatus: 'idle',
			isFetched: false,
			isFetchedAfterMount: false,
			isFetching: false,
			isPaused: false,
			isPending: true,
			isRefetching: false,
			isStale: false,
			isSuccess: false,
			refetch: vi.fn(),
			remove: vi.fn(),
			status: 'pending',
		} as unknown as ReturnType<typeof useQuery>)

		const { container } = render(
			<Wrapper>
				<WeatherWidget parkCode="yose" />
			</Wrapper>,
		)
		expect(await getViolations(container)).toHaveLength(0)
	})

	it('has no axe violations with weather data loaded', async () => {
		vi.mocked(useQuery).mockReturnValue({
			data: { parkCode: 'yose', conditions: 'Sunny', temperature: '72°F', forecast: 'Clear skies all day.' },
			isLoading: false,
			isError: false,
			dataUpdatedAt: Date.now(),
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
		} as unknown as ReturnType<typeof useQuery>)

		const { container } = render(
			<Wrapper>
				<WeatherWidget parkCode="yose" />
			</Wrapper>,
		)
		expect(await getViolations(container)).toHaveLength(0)
	})
})

describe('Accessibility — AlertBanner', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('has no axe violations with alerts', async () => {
		mockUseAlerts.mockReturnValue({
			data: [
				{
					id: 'alert-1',
					url: '',
					title: 'Park Closure',
					parkCode: 'yose',
					description: 'The park is closed for maintenance.',
					category: 'Park Closure',
					lastIndexedDate: '2024-01-01',
				},
			],
			isLoading: false,
			isError: false,
		})

		const { container } = render(
			<Wrapper>
				<AlertBanner parkCode="yose" />
			</Wrapper>,
		)
		expect(await getViolations(container)).toHaveLength(0)
	})

	it('has no axe violations with multiple alerts', async () => {
		mockUseAlerts.mockReturnValue({
			data: [
				{
					id: 'alert-1',
					url: '',
					title: 'Park Closure',
					parkCode: 'yose',
					description: 'The park is closed.',
					category: 'Park Closure',
					lastIndexedDate: '2024-01-01',
				},
				{
					id: 'alert-2',
					url: 'https://example.com/alert',
					title: 'Trail Hazard',
					parkCode: 'yose',
					description: 'Fallen trees on the trail.',
					category: 'Danger',
					lastIndexedDate: '2024-01-02',
				},
			],
			isLoading: false,
			isError: false,
		})

		const { container } = render(
			<Wrapper>
				<AlertBanner parkCode="yose" />
			</Wrapper>,
		)
		expect(await getViolations(container)).toHaveLength(0)
	})

	it('has no axe violations when no alerts (renders nothing)', async () => {
		mockUseAlerts.mockReturnValue({
			data: [],
			isLoading: false,
			isError: false,
		})

		const { container } = render(
			<Wrapper>
				<AlertBanner parkCode="yose" />
			</Wrapper>,
		)
		expect(await getViolations(container)).toHaveLength(0)
	})
})
