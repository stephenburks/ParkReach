'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Park } from '@/types/park';
import { WishlistButton } from './WishlistButton';
import { VisitedButton } from './VisitedButton';
import { handleCardKeyDown, formatStates } from './park-card-utils';

interface Props {
  park: Park;
  onSelect: (park: Park) => void;
}

function ParkCard({ park, onSelect }: Props) {
  const image = park.images[0];
  const stateList = formatStates(park.states);

  return (
    <div
      className="group relative bg-white dark:bg-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-stone-100 dark:border-stone-700 flex flex-col cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest"
      role="button"
      tabIndex={0}
      aria-label={`View details for ${park.fullName}`}
      onClick={() => onSelect(park)}
      onKeyDown={(event) => handleCardKeyDown(event, () => onSelect(park))}
    >
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-park-forest to-park-sage flex-shrink-0">
        {image?.url ? (
          <Image
            src={image.url}
            alt={image.altText || park.fullName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-7xl opacity-20 select-none">🏔️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Action buttons — stopPropagation so they don't trigger the card click */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
          <div className="bg-white/90 dark:bg-stone-800/90 rounded-full p-1.5" onClick={(event) => event.stopPropagation()}>
            <WishlistButton parkCode={park.parkCode} minimal />
          </div>
          <div className="bg-white/90 dark:bg-stone-800/90 rounded-full p-1.5" onClick={(event) => event.stopPropagation()}>
            <VisitedButton parkCode={park.parkCode} minimal />
          </div>
        </div>

        {park.designation && (
          <span className="absolute bottom-3 left-3 bg-park-forest/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {park.designation}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-park-bark dark:text-park-cream text-base leading-snug mb-1.5 group-hover:text-park-forest transition-colors">
          {park.fullName}
        </h3>
        {stateList && (
          <p className="text-xs text-park-stone dark:text-stone-400 mb-3 flex items-center gap-1">
            <span aria-hidden="true">📍</span>
            {stateList}
          </p>
        )}
        <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-3 flex-1">
          {park.description}
        </p>
        <p className="text-xs text-park-sage dark:text-park-sage font-medium mt-3 group-hover:text-park-forest transition-colors">
          View details →
        </p>
      </div>
    </div>
  );
}

export default memo(ParkCard)
