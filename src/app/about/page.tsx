import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter } from '@/components/SiteFooter'
import { HeaderControls } from '@/components/HeaderControls'

const BASE_URL = 'https://parkreach.app'

export const metadata: Metadata = {
	title: 'About ParkReach',
	description:
		'ParkReach is an accessibility-first US national parks explorer. Discover, filter, save, and plan visits with live weather, driving distance, and accessible amenity information.',
	alternates: {
		canonical: `${BASE_URL}/about`,
	},
	openGraph: {
		title: 'About ParkReach',
		description:
			'An accessibility-first national parks explorer. Discover, filter, save, and plan visits with live weather, driving distance, and accessible amenity information.',
		url: `${BASE_URL}/about`,
		type: 'website',
	},
}

export default function AboutPage() {
	return (
		<div className="flex flex-col min-h-screen bg-park-cream dark:bg-park-bark">
			<header className="bg-park-forest text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
				<h1 className="text-3xl font-bold text-park-bark dark:text-park-cream mb-6">
					About ParkReach
				</h1>

				<section className="space-y-4 text-stone-700 dark:text-stone-300 leading-relaxed">
					<p>
						ParkReach is an accessibility-first national parks explorer designed to
						help everyone discover, filter, and plan visits to US national parks.
						Whether you use a wheelchair, have sensory sensitivities, or simply want
						to know which parks offer accessible trails and facilities, ParkReach
						makes that information easy to find.
					</p>

					<p>
						Each park detail page includes accessibility information from the
						National Park Service, live weather forecasts, driving distance
						estimates, entrance fees, operating hours, activities, upcoming events,
						campgrounds, visitor centers, and more. Signed-in users can save parks to
						a wishlist, track parks they&rsquo;ve visited, and create trip plans.
					</p>
				</section>

				<section className="mt-10">
					<h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-4">
						Data Sources
					</h2>
					<ul className="space-y-3 text-stone-700 dark:text-stone-300">
						<li>
							<strong>National Park Service API</strong> — Park data, amenities,
							alerts, campgrounds, visitor centers, events, news, and things to do.
						</li>
						<li>
							<strong>National Weather Service API</strong> — Free, no-key weather
							forecasts for US locations by latitude and longitude.
						</li>
						<li>
							<strong>Google Maps</strong> — Interactive park maps and driving
							distance estimates via the Maps JavaScript API and Distance Matrix API.
						</li>
					</ul>
				</section>

				<section className="mt-10">
					<h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-4">
						Technology
					</h2>
					<ul className="space-y-3 text-stone-700 dark:text-stone-300">
						<li>
							<strong>Next.js 16</strong> — React framework with App Router, Server
							Components, and streaming.
						</li>
						<li>
							<strong>TypeScript</strong> — Strict mode for type safety across the
							full stack.
						</li>
						<li>
							<strong>Tailwind CSS v4</strong> — Utility-first styling with CSS-based
							configuration.
						</li>
						<li>
							<strong>ShadCN</strong> — Accessible, customizable UI components built
							on Radix primitives.
						</li>
						<li>
							<strong>Supabase</strong> — PostgreSQL database, authentication (Google
							OAuth and magic link), and Row Level Security.
						</li>
						<li>
							<strong>NPS API</strong> — US National Park Service data via the
							official developer API.
						</li>
					</ul>
				</section>

				<section className="mt-10">
					<h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-4">
						Accessibility
					</h2>
					<p className="text-stone-700 dark:text-stone-300 leading-relaxed">
						ParkReach targets WCAG 2.1 AA compliance. Every interactive element
						includes keyboard support and visible focus indicators. The interface
						respects <code className="text-sm bg-stone-200 dark:bg-stone-700 px-1 py-0.5 rounded">prefers-reduced-motion</code>{' '}
						and{' '}
						<code className="text-sm bg-stone-200 dark:bg-stone-700 px-1 py-0.5 rounded">forced-colors</code>{' '}
						media queries. Screen reader announcements keep users informed of search
						results and state changes.
					</p>
				</section>

				<section className="mt-10">
					<h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-4">
						Open Source
					</h2>
					<p className="text-stone-700 dark:text-stone-300 leading-relaxed">
						ParkReach is open source software. View the code, report issues, or
						contribute on{' '}
						<a
							href="https://github.com/stephenburks/ParkReach"
							target="_blank"
							rel="noopener noreferrer"
							className="text-park-forest hover:underline font-medium"
						>
							GitHub
						</a>
						.
					</p>
				</section>
			</main>

			<SiteFooter />
		</div>
	)
}
