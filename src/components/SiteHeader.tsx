import Link from 'next/link'
import { HeaderControls } from './HeaderControls'
import { TreePine } from 'lucide-react'

export function SiteHeader() {
	return (
		<header className="bg-park-forest text-white relative">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex items-center justify-between">
					<Link
						href="/"
						className="flex items-center gap-4 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg"
					>
						<div
							className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0"
							aria-hidden="true"
						>
							<TreePine className="h-7 w-7" />
						</div>
						<div>
							<h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
								ParkReach
							</h1>
							<p className="text-park-cream/70 mt-1 text-sm sm:text-base">
								Discover America&apos;s natural and cultural treasures
							</p>
						</div>
					</Link>
					<div className="flex items-center gap-2">
						<HeaderControls />
					</div>
				</div>
			</div>
		</header>
	)
}
