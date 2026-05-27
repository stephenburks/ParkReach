import type { Park } from '@/types/park'
import ParkCard from '@/components/ParkCard'

interface ParkGridViewProps {
	parks: Park[]
	onParkSelect: (park: Park) => void
}

export function ParkGridView({ parks, onParkSelect }: ParkGridViewProps) {
	return (
		<ul
			className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
			role="list"
		>
			{parks.map((park) => (
				<li key={park.id} tabIndex={-1}>
					<ParkCard park={park} onSelect={onParkSelect} />
				</li>
			))}
		</ul>
	)
}
