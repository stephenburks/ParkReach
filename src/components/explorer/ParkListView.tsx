import type { Park } from '@/types/park'
import ParkCardMinimal from '@/components/ParkCardMinimal'

interface ParkListViewProps {
	parks: Park[]
	onParkSelect: (park: Park) => void
}

export function ParkListView({ parks, onParkSelect }: ParkListViewProps) {
	return (
		<ul
			className="divide-y divide-stone-100 dark:divide-stone-700"
			role="list"
		>
			{parks.map((park) => (
				<li key={park.id}>
					<ParkCardMinimal
						park={park}
						onSelect={onParkSelect}
					/>
				</li>
			))}
		</ul>
	)
}
