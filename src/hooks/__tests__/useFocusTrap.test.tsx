/// <reference types="vitest/globals" />
import { render, fireEvent } from '@testing-library/react'
import { useRef } from 'react'
import { useFocusTrap } from '@/hooks/useFocusTrap'

function FocusTrapTestComponent({ active = true }: { active?: boolean }) {
	const containerRef = useRef<HTMLDivElement>(null)
	useFocusTrap(containerRef, active)

	return (
		<div ref={containerRef} data-testid="focus-trap-container">
			<button>First</button>
			<button>Second</button>
			<button>Third</button>
			<a href="#test">Link</a>
		</div>
	)
}

describe('useFocusTrap', () => {
	it('cycles focus forward from last element to first on Tab', () => {
		render(<FocusTrapTestComponent active={true} />)

		const firstBtn = document.querySelectorAll('button')[0] as HTMLButtonElement
		const link = document.querySelector('a[href="#test"]') as HTMLAnchorElement

		link.focus()
		expect(document.activeElement).toBe(link)

		fireEvent.keyDown(document, { key: 'Tab' })
		expect(document.activeElement).toBe(firstBtn)
	})

	it('cycles focus backward from first to last on Shift+Tab', () => {
		render(<FocusTrapTestComponent active={true} />)

		const firstBtn = document.querySelectorAll('button')[0] as HTMLButtonElement
		const link = document.querySelector('a[href="#test"]') as HTMLAnchorElement

		firstBtn.focus()
		expect(document.activeElement).toBe(firstBtn)

		fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
		expect(document.activeElement).toBe(link)
	})

	it('does nothing when active is false', () => {
		render(<FocusTrapTestComponent active={false} />)

		const thirdBtn = document.querySelectorAll('button')[2] as HTMLButtonElement

		thirdBtn.focus()
		fireEvent.keyDown(document, { key: 'Tab' })
		// With inactive trap, Tab should not cycle — focus should stay
		expect(document.activeElement).toBe(thirdBtn)
	})

	it('does not prevent default for non-Tab keys', () => {
		render(<FocusTrapTestComponent active={true} />)

		const firstBtn = document.querySelector('button') as HTMLButtonElement
		firstBtn.focus()

		fireEvent.keyDown(document, { key: 'Escape' })
		expect(document.activeElement).toBe(firstBtn)
	})

	it('handles container with no focusable elements gracefully', () => {
		function EmptyTrap() {
			const ref = useRef<HTMLDivElement>(null)
			useFocusTrap(ref, true)
			return (
				<div ref={ref} data-testid="empty-trap">
					<span>Not focusable</span>
				</div>
			)
		}

		expect(() => {
			render(<EmptyTrap />)
			fireEvent.keyDown(document, { key: 'Tab' })
		}).not.toThrow()
	})

	it('skips disabled elements', () => {
		function DisabledTrap() {
			const ref = useRef<HTMLDivElement>(null)
			useFocusTrap(ref, true)
			return (
				<div ref={ref} data-testid="disabled-trap">
					<button disabled>Disabled</button>
					<button>Active</button>
				</div>
			)
		}

		render(<DisabledTrap />)
		const activeBtn = document.querySelector('button:not([disabled])') as HTMLButtonElement
		activeBtn.focus()
		expect(document.activeElement).toBe(activeBtn)

		fireEvent.keyDown(document, { key: 'Tab' })
		// Only one focusable element, Tab cycles to itself
		expect(document.activeElement).toBe(activeBtn)
	})
})
