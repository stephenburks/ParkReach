'use client'

import { memo } from 'react'
import { Park } from '@/types/park'
import { WishlistButton } from './WishlistButton'
import { VisitedButton } from './VisitedButton'
import { handleCardKeyDown, formatStates } from './park-card-utils'

interface Props {
	park: Park
	onSelect: (park: Park) => void
}

function ParkCardMinimal({ park, onSelect }: Props) {
	const stateList = formatStates(park.states)

	return (
		<div
			className="flex items-center gap-4 px-4 py-3 border-b border-stone-100 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest focus-visible:ring-inset"
			role="button"
			tabIndex={0}
			aria-label={`View details for ${park.fullName}`}
			onClick={() => onSelect(park)}
			onKeyDown={(event) => handleCardKeyDown(event, () => onSelect(park))}
		>
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2 mb-0.5">
					<span className="font-semibold text-[15px] text-park-bark dark:text-park-cream truncate">
						{park.fullName}
					</span>
					{park.designation && (
						<span className="shrink-0 text-[10px] font-medium bg-park-forest/10 text-park-forest px-2 py-0.5 rounded-full">
							{park.designation}
						</span>
					)}
				</div>
				{stateList && (
					<p className="text-xs text-park-stone dark:text-stone-400 truncate">
						<span aria-hidden="true">📍</span> {stateList}
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
