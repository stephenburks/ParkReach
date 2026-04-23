'use client';

import Image from 'next/image';
import { Park } from '@/types/park';

interface Props {
  park: Park;
  onClick: () => void;
}

export default function ParkCard({ park, onClick }: Props) {
  const image = park.images[0];
  const stateList = park.states.split(',').join(' · ');

  return (
    <article
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-stone-100 flex flex-col"
    >
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-park-forest to-park-sage flex-shrink-0">
        {image?.url ? (
          <Image
            src={image.url}
            alt={image.altText || park.fullName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-7xl opacity-20 select-none">🏔️</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {park.designation && (
          <span className="absolute bottom-3 left-3 bg-park-forest/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {park.designation}
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-park-bark text-base leading-snug mb-1.5 group-hover:text-park-forest transition-colors">
          {park.fullName}
        </h3>
        {stateList && (
          <p className="text-xs text-park-stone mb-3 flex items-center gap-1">
            <span aria-hidden="true">📍</span>
            {stateList}
          </p>
        )}
        <p className="text-sm text-stone-600 leading-relaxed line-clamp-3 flex-1">
          {park.description}
        </p>
        <p className="text-xs text-park-sage font-medium mt-3 group-hover:text-park-forest transition-colors">
          View details →
        </p>
      </div>
    </article>
  );
}
