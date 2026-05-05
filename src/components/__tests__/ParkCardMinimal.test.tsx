/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ParkCardMinimal from '../ParkCardMinimal'
import { makePark } from './park-fixture'

const mockPark = makePark({
	id: '2',
	name: 'Grand Canyon',
	fullName: 'Grand Canyon National Park',
	parkCode: 'grca',
	description: 'A dramatic canyon carved by the Colorado River',
	states: 'AZ',
	url: 'https://www.nps.gov/grca',
	latitude: '36.1069',
	longitude: '-112.1129',
	activities: [],
	weatherInfo: '',
	directionsInfo: '',
	directionsUrl: '',
})

describe('ParkCardMinimal', () => {
	it('renders park full name', () => {
		render(<ParkCardMinimal park={mockPark} onSelect={() => {}} />)
		expect(screen.getByText('Grand Canyon National Park')).toBeInTheDocument()
	})

	it('renders designation badge when present', () => {
		render(<ParkCardMinimal park={mockPark} onSelect={() => {}} />)
		expect(screen.getByText('National Park')).toBeInTheDocument()
	})

	it('does not render designation badge when absent', () => {
		const park = { ...mockPark, designation: '' }
		render(<ParkCardMinimal park={park} onSelect={() => {}} />)
		expect(screen.queryByText('National Park')).not.toBeInTheDocument()
	})

	it('formats multi-state parks with · delimiter', () => {
		const park = { ...mockPark, states: 'AZ,NV,UT' }
		render(<ParkCardMinimal park={park} onSelect={() => {}} />)
		expect(screen.getByText('AZ · NV · UT')).toBeInTheDocument()
	})

	it('has correct aria-label for screen readers', () => {
		render(<ParkCardMinimal park={mockPark} onSelect={() => {}} />)
		expect(
			screen.getByRole('button', { name: /view details for grand canyon national park/i }),
		).toBeInTheDocument()
	})

	it('calls onSelect when clicked', async () => {
		const user = userEvent.setup()
		const onSelect = vi.fn()
		render(<ParkCardMinimal park={mockPark} onSelect={onSelect} />)
		await user.click(screen.getByRole('button', { name: /view details/i }))
		expect(onSelect).toHaveBeenCalledWith(mockPark)
	})

	it('calls onSelect on Enter key press', async () => {
		const user = userEvent.setup()
		const onSelect = vi.fn()
		render(<ParkCardMinimal park={mockPark} onSelect={onSelect} />)
		const card = screen.getByRole('button', { name: /view details/i })
		card.focus()
		await user.keyboard('{Enter}')
		expect(onSelect).toHaveBeenCalledWith(mockPark)
	})

	it('calls onSelect on Space key press', async () => {
		const user = userEvent.setup()
		const onSelect = vi.fn()
		render(<ParkCardMinimal park={mockPark} onSelect={onSelect} />)
		const card = screen.getByRole('button', { name: /view details/i })
		card.focus()
		await user.keyboard(' ')
		expect(onSelect).toHaveBeenCalledWith(mockPark)
	})
})
