import { cn } from './utils'

describe('cn', () => {
	it('returns a single class unchanged', () => {
		expect(cn('foo')).toBe('foo')
	})

	it('merges multiple classes', () => {
		expect(cn('foo', 'bar')).toBe('foo bar')
	})

	it('handles conditional classes', () => {
		expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
	})

	it('deduplicates conflicting Tailwind classes (last wins)', () => {
		expect(cn('p-2', 'p-4')).toBe('p-4')
	})

	it('handles undefined and null gracefully', () => {
		expect(cn('base', undefined, null, 'end')).toBe('base end')
	})
})
