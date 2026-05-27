import type { Park } from '@/types/park'
import ParkCardMinimal from '@/components/ParkCardMinimal'

interface ParkListViewProps {
	parks: Park[]
	onParkSelect: (park: Park) => void
}

export function ParkListView({ parks, onParkSelect }: ParkListViewProps) {
	return (
		<ul
			className="space-y-3"
			role="list"
		>
			{parks.map((park) => (
				<li key={park.id} tabIndex={-1}>
					<ParkCardMinimal
						park={park}
						onSelect={onParkSelect}
					/>
				</li>
			))}
		</ul>
	)
}
