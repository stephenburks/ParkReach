'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Park } from '@/types/park';
import { WishlistButton } from '@/components/WishlistButton';
import { VisitedButton } from '@/components/VisitedButton';

interface Props {
  park: Park;
  onClose: () => void;
}

const DAY_ORDER: Array<keyof import('@/types/park').ParkHours> = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

export default function ParkModal({ park, onClose }: Props) {
  const image = park.images[0];
  const topActivities = park.activities.slice(0, 10);
  const hasFees = park.entranceFees.length > 0;
  const hasHours = park.operatingHours.length > 0;
  const stateList = park.states.split(',').join(' · ');

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={park.fullName}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-2xl bg-park-cream dark:bg-stone-800 rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto z-10">
        {/* Hero */}
        <div className="relative h-64 sm:h-72 bg-gradient-to-br from-park-forest to-park-sage rounded-t-3xl sm:rounded-t-2xl overflow-hidden flex-shrink-0">
          {image?.url && (
            <Image
              src={image.url}
              alt={image.altText || park.fullName}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 672px"
              unoptimized
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors text-lg font-medium"
            aria-label="Close modal"
          >
            ✕
          </button>

          <a
            href={`/parks/${park.parkCode}`}
            className="absolute top-4 left-4 bg-black/40 hover:bg-black/70 text-white rounded-full px-4 h-10 flex items-center justify-center transition-colors text-sm font-medium"
          >
            Full Page →
          </a>

          <div className="absolute bottom-4 left-5 right-16">
            {park.designation && (
              <span className="bg-park-forest/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full mb-2 inline-block">
                {park.designation}
              </span>
            )}
            <h2 className="text-white text-2xl font-bold leading-tight drop-shadow-md">
              {park.fullName}
            </h2>
            {stateList && (
              <p className="text-white/80 text-sm mt-1">📍 {stateList}</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <WishlistButton parkCode={park.parkCode} />
            <VisitedButton parkCode={park.parkCode} />
          </div>

          <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{park.description}</p>

          {topActivities.length > 0 && (
            <section>
              <h3 className="font-semibold text-park-bark dark:text-park-cream text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <span aria-hidden="true">🥾</span> Activities
              </h3>
              <div className="flex flex-wrap gap-2">
                {topActivities.map((a) => (
                  <span
                    key={a.id}
                    className="bg-park-sage/15 dark:bg-park-sage/25 text-park-bark dark:text-park-cream text-xs px-3 py-1.5 rounded-full border border-park-sage/30 font-medium"
                  >
                    {a.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {hasHours && (
            <section>
              <h3 className="font-semibold text-park-bark dark:text-park-cream text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <span aria-hidden="true">🕐</span> Operating Hours
              </h3>
              {park.operatingHours.slice(0, 1).map((h, i) => (
                <div key={i} className="bg-white dark:bg-stone-700 rounded-xl p-4 shadow-sm">
                  {h.name && (
                    <p className="text-sm font-semibold text-park-bark dark:text-park-cream mb-2">{h.name}</p>
                  )}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {DAY_ORDER.map((day) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-stone-500 dark:text-stone-400 capitalize">{day}</span>
                        <span className="text-park-bark dark:text-park-cream font-medium">{h.standardHours[day] || 'Closed'}</span>
                      </div>
                    ))}
                  </div>
                  {h.description && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 pt-3 border-t border-stone-100 dark:border-stone-600 leading-relaxed">
                      {h.description}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}

          {hasFees ? (
            <section>
              <h3 className="font-semibold text-park-bark dark:text-park-cream text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <span aria-hidden="true">🎟️</span> Entrance Fees
              </h3>
              <div className="space-y-2">
                {park.entranceFees.map((fee, i) => (
                  <div key={i} className="bg-white dark:bg-stone-700 rounded-xl p-4 flex justify-between items-start shadow-sm gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-park-bark dark:text-park-cream">{fee.title}</p>
                      {fee.description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">{fee.description}</p>
                      )}
                    </div>
                    <span className="text-park-sage font-bold text-lg flex-shrink-0">
                      {fee.cost === '0.00' ? 'Free' : `$${fee.cost}`}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <div className="bg-park-sage/10 border border-park-sage/30 dark:border-park-sage/50 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🆓</span>
              <div>
                <p className="font-semibold text-park-bark dark:text-park-cream text-sm">Free to Visit</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">No entrance fee for this park</p>
              </div>
            </div>
          )}

          {park.weatherInfo && (
            <section>
              <h3 className="font-semibold text-park-bark dark:text-park-cream text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                <span aria-hidden="true">🌤️</span> Weather
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{park.weatherInfo}</p>
            </section>
          )}

          <a
            href={park.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-park-forest hover:bg-park-bark text-white font-semibold py-3.5 px-6 rounded-xl transition-colors text-sm"
          >
            Visit Official NPS Page <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}