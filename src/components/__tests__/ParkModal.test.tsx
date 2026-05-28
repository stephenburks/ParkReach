/// <reference types="vitest/globals" />
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ParkModal from '@/components/ParkModal'
import { Park } from '@/types/park'

// Mock useParkEnrichment to bypass the fetch — use the park prop directly
vi.mock('@/hooks/useParks', async () => {
	const actual = await vi.importActual('@/hooks/useParks')
	return {
		...actual,
		useParkEnrichment: () => ({ data: null, isLoading: false, isError: false }),
	}
})

// Mock child components
vi.mock('@/components/WishlistButton', () => ({
	WishlistButton: ({ parkCode }: { parkCode?: string }) => (
		<button data-testid="wishlist-btn">Wishlist {parkCode}</button>
	),
}))
vi.mock('@/components/VisitedButton', () => ({
	VisitedButton: ({ parkCode }: { parkCode?: string }) => (
		<button data-testid="visited-btn">Visited {parkCode}</button>
	),
}))
vi.mock('@/components/AddToTripButton', () => ({
	AddToTripButton: ({ parkCode }: { parkCode?: string }) => (
		<button data-testid="add-to-trip-btn">Add to Trip {parkCode}</button>
	),
}))
vi.mock('@/components/AlertBadge', () => ({
	AlertBadge: ({ alertSummary }: { alertSummary?: { alert_count?: number; has_closure?: boolean; has_danger?: boolean; alert_level?: string | null } }) => {
		if (!alertSummary?.alert_count) return null
		return <span data-testid="alert-badge">{alertSummary.alert_count} alerts</span>
	},
}))
vi.mock('@/components/WeatherWidget', () => ({
	WeatherWidget: ({ parkCode }: { parkCode?: string }) => (
		<div data-testid="weather-widget">Weather for {parkCode}</div>
	),
}))
vi.mock('@/components/DistanceBadge', () => ({
	DistanceBadge: ({ parkCode }: { parkCode?: string }) => (
		<div data-testid="distance-badge">Distance for {parkCode}</div>
	),
}))
vi.mock('@/hooks/useFocusTrap', () => ({
	useFocusTrap: () => {},
}))

// Mock next/image
vi.mock('next/image', () => ({
	default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; priority?: boolean; sizes?: string }) => {
		const { fill: _fill, priority: _priority, sizes: _sizes, ...rest } = props
		return <img {...rest} alt={props.alt} />
	},
}))

// Mock next/link
vi.mock('next/link', () => ({
	default: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
		<a href={href}>{children}</a>
	),
}))

function Wrapper({ children }: { children: React.ReactNode }) {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	})
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

const basePark: Park = {
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
	topics: [
		{ id: 't1', name: 'Animals' },
		{ id: 't2', name: 'Geology' },
	],
	entranceFees: [
		{ title: 'Vehicle', description: 'Per vehicle', cost: '35.00' },
	],
	entrancePasses: [],
	operatingHours: [
		{
			name: 'Yosemite',
			description: 'Open daily',
			standardHours: {
				monday: '24/7', tuesday: '24/7', wednesday: '24/7', thursday: '24/7',
				friday: '24/7', saturday: '24/7', sunday: '24/7',
			},
			exceptions: [],
		},
	],
	images: [{ url: 'https://example.com/yosemite.jpg', altText: 'Yosemite Valley', title: '', credit: '', caption: '' }],
	weatherInfo: 'Weather varies by elevation.',
	directionsInfo: 'Take Highway 140.',
	directionsUrl: 'https://maps.example.com/yosemite',
	alert_count: 2,
	has_closure: false,
	has_danger: true,
	alert_level: 'danger',
	has_wheelchair_access: true,
	has_braille: true,
	has_asl: false,
	has_audio_description: true,
	has_accessible_restrooms: true,
	has_service_animal_relief: false,
	accessibility: 'Park has accessible features.',
}

function renderParkModal(park: Park = basePark, onClose = vi.fn()) {
	return render(<ParkModal park={park} onClose={onClose} />, { wrapper: Wrapper })
}

describe('ParkModal', () => {
	const onClose = vi.fn()

	beforeEach(() => {
		onClose.mockClear()
		Object.defineProperty(document.body, 'style', {
			value: { overflow: '' },
			writable: true,
		})
	})

	it('renders park fullName and designation', () => {
		renderParkModal(basePark, onClose)
		expect(screen.getByText('Yosemite National Park')).toBeInTheDocument()
		expect(screen.getByText('National Park')).toBeInTheDocument()
	})

	it('renders description', () => {
		renderParkModal(basePark, onClose)
		expect(screen.getByText('A beautiful park in California.')).toBeInTheDocument()
	})

	it('renders activities', () => {
		renderParkModal(basePark, onClose)
		expect(screen.getByText('Hiking')).toBeInTheDocument()
		expect(screen.getByText('Camping')).toBeInTheDocument()
	})

	it('renders topics', () => {
		renderParkModal(basePark, onClose)
		expect(screen.getByText('Animals')).toBeInTheDocument()
		expect(screen.getByText('Geology')).toBeInTheDocument()
	})

	it('does not render topics section when none', () => {
		const noTopicsPark = { ...basePark, topics: [] }
		renderParkModal(noTopicsPark, onClose)
		expect(screen.queryByText('Topics')).toBeNull()
	})

	it('renders entrance fees', () => {
		renderParkModal(basePark, onClose)
		expect(screen.getByText('Vehicle')).toBeInTheDocument()
		expect(screen.getByText('$35.00')).toBeInTheDocument()
	})

	it('renders free to visit when no fees', () => {
		const freePark = { ...basePark, entranceFees: [] }
		renderParkModal(freePark, onClose)
		expect(screen.getByText('Free to Visit')).toBeInTheDocument()
		expect(screen.getByText('No entrance fee for this park')).toBeInTheDocument()
	})

	it('renders operating hours', () => {
		renderParkModal(basePark, onClose)
		expect(screen.getByText('Yosemite')).toBeInTheDocument()
		expect(screen.getByText('Open daily')).toBeInTheDocument()
	})

	it('does not render operating hours section when none', () => {
		const noHoursPark = { ...basePark, operatingHours: [] }
		renderParkModal(noHoursPark, onClose)
		expect(screen.queryByText('Operating Hours')).toBeNull()
	})

	it('renders weather widget', () => {
		renderParkModal(basePark, onClose)
		expect(screen.getByTestId('weather-widget')).toBeInTheDocument()
	})

	it('renders distance badge', () => {
		renderParkModal(basePark, onClose)
		expect(screen.getByTestId('distance-badge')).toBeInTheDocument()
	})

	it('renders alert badge when alerts exist', () => {
		renderParkModal(basePark, onClose)
		expect(screen.getByTestId('alert-badge')).toBeInTheDocument()
		expect(screen.getByText('2 alerts')).toBeInTheDocument()
	})

	it('does not render alert badge when no alerts', () => {
		const noAlertPark = { ...basePark, alert_count: 0, has_closure: false, has_danger: false, alert_level: null }
		renderParkModal(noAlertPark, onClose)
		expect(screen.queryByTestId('alert-badge')).toBeNull()
	})

	it('renders accessibility flags', () => {
		renderParkModal(basePark, onClose)
		expect(screen.getByText('Wheelchair Access')).toBeInTheDocument()
		expect(screen.getByText('Braille')).toBeInTheDocument()
		expect(screen.getByText('Audio Description')).toBeInTheDocument()
	})

	it('does not render ASL flag when false', () => {
		renderParkModal(basePark, onClose)
		expect(screen.queryByText('ASL')).toBeNull()
	})

	it('does not render accessibility section when no flags', () => {
		const noA11yPark = {
			...basePark,
			has_wheelchair_access: false,
			has_braille: false,
			has_asl: false,
			has_audio_description: false,
		}
		renderParkModal(noA11yPark, onClose)
		expect(screen.queryByText('Wheelchair Access')).toBeNull()
	})

	it('renders directions section when directionsUrl exists', () => {
		renderParkModal(basePark, onClose)
		expect(screen.getByText('Take Highway 140.')).toBeInTheDocument()
		expect(screen.getByText('Getting There')).toBeInTheDocument()
	})

	it('does not render directions section when no directionsUrl', () => {
		const noDirPark = { ...basePark, directionsUrl: '' }
		renderParkModal(noDirPark, onClose)
		expect(screen.queryByText('Getting There')).toBeNull()
	})

	it('renders action buttons', () => {
		renderParkModal(basePark, onClose)
		expect(screen.getByTestId('wishlist-btn')).toBeInTheDocument()
		expect(screen.getByTestId('visited-btn')).toBeInTheDocument()
		expect(screen.getByTestId('add-to-trip-btn')).toBeInTheDocument()
	})

	it('renders official NPS page link', () => {
		renderParkModal(basePark, onClose)
		const link = screen.getByText('Visit Official NPS Page')
		expect(link.closest('a')).toHaveAttribute('href', basePark.url)
	})

	it('renders full page link', () => {
		renderParkModal(basePark, onClose)
		const link = screen.getByText(/Full Page/)
		expect(link.closest('a')).toHaveAttribute('href', '/parks/yose')
	})

	it('renders state list', () => {
		renderParkModal(basePark, onClose)
		expect(screen.getByText(/CA/)).toBeInTheDocument()
	})

	it('calls onClose when close button clicked', () => {
		renderParkModal(basePark, onClose)
		const closeBtn = screen.getByLabelText('Close modal')
		fireEvent.click(closeBtn)
		expect(onClose).toHaveBeenCalledTimes(1)
	})

	it('calls onClose when backdrop clicked', () => {
		renderParkModal(basePark, onClose)
		const backdrop = screen.getByRole('dialog').firstElementChild
		if (backdrop) fireEvent.click(backdrop)
		expect(onClose).toHaveBeenCalledTimes(1)
	})

	it('calls onClose on Escape key', () => {
		renderParkModal(basePark, onClose)
		fireEvent.keyDown(document, { key: 'Escape' })
		expect(onClose).toHaveBeenCalledTimes(1)
	})

	it('has correct ARIA attributes', () => {
		renderParkModal(basePark, onClose)
		const dialog = screen.getByRole('dialog')
		expect(dialog).toHaveAttribute('aria-modal', 'true')
		expect(dialog).toHaveAttribute('aria-labelledby', 'park-modal-heading')
	})

	it('renders image with alt text', () => {
		renderParkModal(basePark, onClose)
		const img = screen.getByAltText('Yosemite Valley') as HTMLImageElement
		expect(img).toBeInTheDocument()
		expect(img).toHaveAttribute('src', basePark.images[0].url)
	})

	it('renders without image when none provided', () => {
		const noImagePark = { ...basePark, images: [] }
		renderParkModal(noImagePark, onClose)
		expect(screen.getByRole('dialog')).toBeInTheDocument()
	})
})
