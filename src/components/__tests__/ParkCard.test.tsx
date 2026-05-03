/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ParkCard from '../ParkCard'
import { Park } from '@/types/park'

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
  activities: [{ id: '1', name: 'Hiking' }],
  topics: [],
  entranceFees: [],
  entrancePasses: [],
  operatingHours: [],
  images: [],
  weatherInfo: 'Sunny',
  directionsInfo: 'Drive west',
  directionsUrl: 'https://example.com',
}

describe('ParkCard', () => {
  it('renders park name', () => {
    render(<ParkCard park={mockPark} onSelect={() => {}} />)
    expect(screen.getByText('Yosemite National Park')).toBeInTheDocument()
  })

  it('renders park designation', () => {
    render(<ParkCard park={mockPark} onSelect={() => {}} />)
    expect(screen.getByText('National Park')).toBeInTheDocument()
  })

  it('calls onSelect when clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<ParkCard park={mockPark} onSelect={onSelect} />)
    await user.click(screen.getByRole('button', { name: /yosemite national park/i }))
    expect(onSelect).toHaveBeenCalledWith(mockPark)
  })

  it('responds to Enter key press', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<ParkCard park={mockPark} onSelect={onSelect} />)
    const card = screen.getByRole('button', { name: /yosemite national park/i })
    card.focus()
    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith(mockPark)
  })

  it('responds to Space key press', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<ParkCard park={mockPark} onSelect={onSelect} />)
    const card = screen.getByRole('button', { name: /yosemite national park/i })
    card.focus()
    await user.keyboard(' ')
    expect(onSelect).toHaveBeenCalledWith(mockPark)
  })
})
