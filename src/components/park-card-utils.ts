import { type KeyboardEvent } from 'react'

export function handleCardKeyDown(event: KeyboardEvent<HTMLDivElement>, onSelect: () => void) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		onSelect()
	}
}

export function formatStates(states: string): string {
	return states.split(',').join(' · ')
}
