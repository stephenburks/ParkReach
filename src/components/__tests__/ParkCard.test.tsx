/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ParkCard from '../ParkCard'
import { makePark, KEYBOARD_ACTIVATION_CASES } from './park-fixture'

const mockPark = makePark()

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

  it.each(KEYBOARD_ACTIVATION_CASES)('responds to %s key press', async (_label, key) => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<ParkCard park={mockPark} onSelect={onSelect} />)
    const card = screen.getByRole('button', { name: /yosemite national park/i })
    card.focus()
    await user.keyboard(key)
    expect(onSelect).toHaveBeenCalledWith(mockPark)
  })
})
