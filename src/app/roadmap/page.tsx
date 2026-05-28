import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { HeaderControls } from '@/components/HeaderControls'

const BASE_URL = 'https://parkreach.app'

export const metadata: Metadata = {
	title: 'Roadmap | ParkReach',
	description:
		'See what features are done, in progress, planned, and on the horizon for ParkReach.',
	alternates: {
		canonical: `${BASE_URL}/roadmap`,
	},
	openGraph: {
		title: 'Roadmap | ParkReach',
		description:
			'What is built, what is in progress, and what is planned for the ParkReach national parks explorer.',
		url: `${BASE_URL}/roadmap`,
		type: 'website',
	},
}

const sections: Array<{ status: string; items: string[] }> = [
	{
		status: 'Done',
		items: [
			'Supabase database with profiles, park saves, and trips tables (RLS enforced)',
			'Google OAuth and magic link sign-in with account linking',
			'Park explorer with Cards, Minimal, and Map views (URL-driven state)',
			'Park of the Day hero on landing page (deterministic by date)',
			'Full park detail pages with weather, distance, fees, hours, and alerts',
			'Amenities-based accessibility information per park',
			'Save to wishlist and mark as visited (persisted to Supabase)',
			'User profile with wishlist, visited parks, and trip plans',
			'Dynamic OG images for park detail pages',
			'Content Security Policy with nonce-based script injection',
			'Map marker clustering for large numbers of park pins',
			'WCAG 2.1 AA baseline: focus rings, aria labels, reduced motion, forced colors',
			'Unit and E2E test coverage (Vitest + Playwright)',
			'SEO: sitemap, robots.txt, canonical URLs, JSON-LD structured data',
			'Keyboard shortcut help dialog (press ?)',
		],
	},
	{
		status: 'In Progress',
		items: [
			'GitHub link and About page',
			'Section jump links on park detail pages',
			'Roadmap page (this page)',
		],
	},
	{
		status: 'Planned',
		items: [
			'Magic link sign-in with email-only flow',
			'Structured data for more park detail fields (events, campgrounds)',
			'Accessibility filter improvements with better amenity categorization',
			'Profile settings page (display name, avatar upload, default view)',
			'Shareable trip links with read-only views',
			'Park comparison tool (side-by-side details)',
		],
	},
	{
		status: 'Future (Blocked)',
		items: [
			'Apple Sign In — blocked by paid Apple Developer account',
			'Passkeys (WebAuthn) — blocked by Supabase WebAuthn reaching GA',
		],
	},
]

const statusStyles: Record<string, string> = {
	Done: 'bg-park-forest/90 text-white',
	'In Progress': 'bg-park-sky/90 text-white',
	Planned: 'bg-park-stone/90 text-white',
	'Future (Blocked)': 'bg-stone-400/90 text-white',
}

export default function RoadmapPage() {
	return (
		<div className="flex flex-col min-h-screen bg-park-cream dark:bg-park-bark">
			<header className="bg-park-forest text-white relative">
				<div className="max-w-full lg:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center justify-between">
						<Link
							href="/"
							className="text-park-cream hover:text-white font-semibold"
						>
							← Back to Parks
						</Link>
						<HeaderControls />
					</div>
				</div>
			</header>

			<main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<h1 className="text-3xl font-bold text-park-bark dark:text-park-cream mb-2">
					Roadmap
				</h1>
				<p className="text-stone-500 dark:text-stone-400 mb-10">
					What is built, what is in progress, and what is planned.
				</p>

				<div className="space-y-10">
					{sections.map((section) => (
						<section key={section.status}>
							<h2 className="flex items-center gap-3 mb-4">
								<span
									className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[section.status] ?? 'bg-stone-400 text-white'}`}
								>
									{section.status}
								</span>
							</h2>
							<ul className="space-y-2">
								{section.items.map((item) => (
									<li
										key={item}
										className="flex items-start gap-3 text-stone-700 dark:text-stone-300"
									>
										<span
											className="mt-0.5 text-park-forest dark:text-park-sage shrink-0 select-none"
											aria-hidden="true"
										>
											{section.status === 'Done' ? '☑' : '☐'}
										</span>
										<span>{item}</span>
									</li>
								))}
							</ul>
						</section>
					))}
				</div>

				<section className="mt-10 pt-8 border-t border-stone-200 dark:border-stone-700">
					<p className="text-sm text-stone-500 dark:text-stone-400">
						Have an idea?{' '}
						<a
							href="https://github.com/stephenburks/ParkReach/issues"
							target="_blank"
							rel="noopener noreferrer"
							className="text-park-forest hover:underline font-medium"
						>
							Open an issue on GitHub
						</a>
						.
					</p>
				</section>
			</main>

			<SiteFooter />
		</div>
	)
}
