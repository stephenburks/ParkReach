import Link from 'next/link'
import { HeaderControls } from './HeaderControls'
import { TreePine } from 'lucide-react'

export function SiteHeader() {
	return (
		<header className="bg-park-forest text-white relative">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
				<div className="flex items-center justify-between">
					<Link
						href="/"
						className="flex items-center gap-3 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg"
					>
						<div
							className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0"
							aria-hidden="true"
						>
							<TreePine className="h-5 w-5" />
						</div>
						<span className="text-xl font-bold tracking-tight">ParkReach</span>
					</Link>
					<div className="flex items-center gap-2">
						<HeaderControls />
					</div>
				</div>
			</div>
		</header>
	)
}
