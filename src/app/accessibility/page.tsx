import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'Accessibility | ParkReach',
	description: 'ParkReach accessibility statement — WCAG 2.1 AA compliance, known issues, and how to report barriers.',
	alternates: {
		canonical: 'https://parkreach.app/accessibility',
	},
}

export default function AccessibilityPage() {
	return (
		<div className="min-h-screen bg-park-cream dark:bg-park-bark">
			<header className="bg-park-forest text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<Link
						href="/"
						className="text-park-cream hover:text-white font-semibold"
					>
						← Back to Parks
					</Link>
				</div>
			</header>

			<main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
				<h1 className="text-3xl font-bold text-park-bark dark:text-park-cream">
					Accessibility Statement
				</h1>

				<p className="text-stone-700 dark:text-stone-300 leading-relaxed">
					ParkReach is committed to providing a website that is accessible to the widest
					possible audience. We actively work to increase the accessibility and usability
					of our site and adhere to available standards and guidelines.
				</p>

				<section>
					<h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">
						Conformance Status
					</h2>
					<p className="text-stone-700 dark:text-stone-300 leading-relaxed">
						ParkReach aims to conform to{' '}
						<a
							href="https://www.w3.org/TR/WCAG21/"
							className="text-park-forest hover:underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							WCAG 2.1 Level AA
						</a>{' '}
						standards. We run automated accessibility audits on every change and perform
						manual testing with assistive technologies including VoiceOver and keyboard-only
						navigation.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">
						Accessibility Features
					</h2>
					<ul className="list-disc pl-5 space-y-2 text-stone-700 dark:text-stone-300">
						<li>Skip-to-content link on every page</li>
						<li>Keyboard-navigable park cards and modals</li>
						<li>Visible focus indicators on all interactive elements</li>
						<li>ARIA labels on icon-only buttons</li>
						<li>Semantic HTML with landmark regions</li>
						<li>Live region announcements for dynamic content</li>
						<li>Dark mode with verified color contrast</li>
						<li>Reduced motion support for users who prefer less animation</li>
						<li>Accessibility information sourced from NPS data on park detail pages</li>
					</ul>
				</section>

				<section>
					<h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">
						Known Limitations
					</h2>
					<p className="text-stone-700 dark:text-stone-300 leading-relaxed">
						The map view uses Google Maps, which embeds a third-party iframe. Some map
						interactions may not be fully keyboard-accessible. A &quot;View as list&quot; link is
						provided at the top of map pages as an alternative.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3">
						Feedback
					</h2>
					<p className="text-stone-700 dark:text-stone-300 leading-relaxed">
						We welcome feedback on the accessibility of ParkReach. If you encounter any
						barriers, please let us know by opening an issue on our{' '}
						<a
							href="https://github.com/stephenburks/ParkReach"
							className="text-park-forest hover:underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub repository
						</a>.
					</p>
				</section>

				<p className="text-sm text-stone-500 dark:text-stone-400 pt-4 border-t border-stone-200 dark:border-stone-700">
					Last updated: May 2026
				</p>
			</main>
		</div>
	)
}
