import { test, expect } from '@playwright/test'

// Minimal park fixture — enough for the card + modal to render
const YOSEMITE = {
	id: '1',
	parkCode: 'yose',
	fullName: 'Yosemite National Park',
	name: 'Yosemite',
	description: 'A stunning wilderness park in the Sierra Nevada mountains of California.',
	designation: 'National Park',
	states: 'CA',
	url: 'https://www.nps.gov/yose',
	latitude: '37.8651',
	longitude: '-119.5383',
	images: [],
	activities: [{ id: '1', name: 'Hiking' }],
	topics: [],
	entranceFees: [],
	entrancePasses: [],
	operatingHours: [],
	weatherInfo: 'Mild summers, snowy winters.',
	directionsInfo: 'Via Highway 140.',
	directionsUrl: 'https://www.nps.gov/yose/planyourvisit/directions.htm',
}

const PARKS_RESPONSE = {
	data: [YOSEMITE],
	total: '1',
	limit: '24',
	start: '0',
}

test.describe('Save flow', () => {
	test.beforeEach(async ({ page }) => {
		// Intercept the client-side parks API so tests run without a real NPS key
		await page.route('/api/parks*', (route) =>
			route.fulfill({ json: PARKS_RESPONSE }),
		)
		// Stub amenities to avoid 500 errors on park detail
		await page.route('/api/amenities/**', (route) =>
			route.fulfill({ json: { data: [] } }),
		)
	})

	test('home page renders the parks explorer', async ({ page }) => {
		await page.goto('/')
		await expect(page.getByRole('button', { name: /yosemite national park/i })).toBeVisible()
	})

	test('clicking a park card opens the detail modal', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: /yosemite national park/i }).click()
		await expect(page.getByRole('dialog')).toBeVisible()
		await expect(page.getByRole('dialog')).toContainText('Yosemite National Park')
	})

	test('unauthenticated wishlist click shows sign-in prompt', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: /yosemite national park/i }).click()

		const dialog = page.getByRole('dialog')
		await dialog.waitFor()

		// Scroll save buttons into view before clicking (modal body is scrollable)
		const wishlistBtn = dialog.getByRole('button', { name: /add to wishlist/i })
		await wishlistBtn.scrollIntoViewIfNeeded()
		await wishlistBtn.click()

		// sonner toast should appear
		await expect(page.getByText(/sign in to save parks to your wishlist/i)).toBeVisible()
	})

	test('unauthenticated visited click shows sign-in prompt', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: /yosemite national park/i }).click()

		const dialog = page.getByRole('dialog')
		await dialog.waitFor()

		const visitedBtn = dialog.getByRole('button', { name: /mark as visited/i })
		await visitedBtn.scrollIntoViewIfNeeded()
		await visitedBtn.click()

		await expect(page.getByText('Sign in to mark parks as visited')).toBeVisible()
	})

	test('modal closes on Escape key', async ({ page }) => {
		await page.goto('/')
		await page.getByRole('button', { name: /yosemite national park/i }).click()
		await page.getByRole('dialog').waitFor()

		await page.keyboard.press('Escape')

		await expect(page.getByRole('dialog')).not.toBeVisible()
	})

	test('search filter narrows the park list', async ({ page }) => {
		// Override to return empty results for a non-matching query
		await page.route('/api/parks*', (route) => {
			const url = new URL(route.request().url())
			const q = url.searchParams.get('q') ?? ''
			route.fulfill({
				json: q === 'nothing' ? { data: [], total: '0', limit: '24', start: '0' } : PARKS_RESPONSE,
			})
		})

		await page.goto('/')
		await expect(page.getByRole('button', { name: /yosemite/i })).toBeVisible()

		await page.getByLabel('Search parks').fill('nothing')
		// The aria-live results count shows this exact string when the API returns 0 results
		await expect(page.getByText('No places found — try a different search')).toBeVisible({ timeout: 5000 })
	})
})
