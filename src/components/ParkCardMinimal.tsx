'use client'

import { memo } from 'react'
import { Park } from '@/types/park'
import { WishlistButton } from './WishlistButton'
import { VisitedButton } from './VisitedButton'
import { AlertBadge } from './AlertBadge'
import { handleCardKeyDown, formatStates } from './park-card-utils'
import { MapPin } from 'lucide-react'

interface Props {
	park: Park
	onSelect: (park: Park) => void
}

function ParkCardMinimal({ park, onSelect }: Props) {
	const stateList = formatStates(park.states)

	const alertSummary = {
		alert_count: park.alert_count,
		has_closure: park.has_closure,
		has_danger: park.has_danger,
		alert_level: park.alert_level,
	}

	return (
		<div
			className="flex items-center gap-4 px-5 py-4 bg-white dark:bg-stone-800 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-700/70 transition-colors cursor-pointer shadow-sm border border-stone-200 dark:border-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest"
			role="button"
			tabIndex={0}
			aria-label={`View details for ${park.fullName}`}
			onClick={() => onSelect(park)}
			onKeyDown={(event) => handleCardKeyDown(event, () => onSelect(park))}
		>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-0.5">
					<h3 className="font-semibold text-[15px] text-park-bark dark:text-park-cream truncate">
						{park.fullName}
					</h3>
					{park.designation && (
						<span className="shrink-0 text-[10px] font-medium bg-park-forest/10 text-park-forest px-2 py-0.5 rounded-full">
							{park.designation}
						</span>
					)}
					<AlertBadge alertSummary={alertSummary} />
				</div>
				{stateList && (
					<p className="text-xs text-park-stone dark:text-stone-400 truncate">
						<MapPin className="h-3 w-3 inline mr-1" aria-hidden="true" />{stateList}
					</p>
				)}
			</div>
			<div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
				<WishlistButton parkCode={park.parkCode} minimal />
				<VisitedButton parkCode={park.parkCode} minimal />
			</div>
		</div>
	)
}

export default memo(ParkCardMinimal)
