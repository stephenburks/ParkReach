'use client';

import { Park } from '@/types/park';

interface Props {
  park: Park;
  onClick: () => void;
}

export function ParkCardMinimal({ park, onClick }: Props) {
  const stateList = park.states.split(',').join(', ');

  return (
    <article
      onClick={onClick}
      className="cursor-pointer bg-white dark:bg-stone-800 rounded-xl p-3 shadow-sm hover:shadow-md transition-all border border-stone-100 dark:border-stone-700"
    >
      <h3 className="font-semibold text-park-bark dark:text-park-cream text-sm leading-snug mb-1">
        {park.fullName}
      </h3>
      <p className="text-xs text-park-stone dark:text-stone-400">
        {stateList}
      </p>
      {park.designation && (
        <p className="text-xs text-park-sage dark:text-park-sage mt-1">
          {park.designation}
        </p>
      )}
    </article>
  );
}