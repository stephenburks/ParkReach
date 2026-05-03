import { ParkOfTheDay } from '@/components/ParkOfTheDay'
import { ExplorerClient } from '@/components/ExplorerClient'
import { HeaderControls } from '@/components/HeaderControls'

export default function Home() {
	return (
		<div className="min-h-screen bg-park-cream dark:bg-park-bark">
			{/* Header */}
			<header className="bg-park-forest text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div
								className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center text-3xl flex-shrink-0"
								aria-hidden="true"
							>
								🏕️
							</div>
							<div>
								<h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
									ParkReach
								</h1>
								<p className="text-park-cream/70 mt-1 text-sm sm:text-base">
									Discover America&apos;s natural and cultural treasures
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<HeaderControls />
						</div>
					</div>
				</div>
			</header>

			<ParkOfTheDay />

			<ExplorerClient />
		</div>
	)
}
