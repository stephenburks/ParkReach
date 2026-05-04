'use client'

import { useCallback, useEffect } from 'react'

const FOCUSABLE_SELECTOR =
	'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function useFocusTrap(
	containerRef: React.RefObject<HTMLElement | null>,
	active: boolean,
) {
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key !== 'Tab' || !containerRef.current) return

			const focusable = Array.from(
				containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
			).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)

			if (focusable.length === 0) return

			const first = focusable[0]
			const last = focusable[focusable.length - 1]

			if (event.shiftKey) {
				if (document.activeElement === first) {
					event.preventDefault()
					last.focus()
				}
			} else {
				if (document.activeElement === last) {
					event.preventDefault()
					first.focus()
				}
			}
		},
		[containerRef],
	)

	useEffect(() => {
		if (!active) return
		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [active, handleKeyDown])
}
