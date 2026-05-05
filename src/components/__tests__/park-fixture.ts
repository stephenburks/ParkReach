import type { Park } from '@/types/park'

const BASE_PARK: Park = {
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

export function makePark(overrides: Partial<Park> = {}): Park {
	return { ...BASE_PARK, ...overrides }
}

export const KEYBOARD_ACTIVATION_CASES = [
	['Enter', '{Enter}'],
	['Space', ' '],
] as const
