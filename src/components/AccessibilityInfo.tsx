interface AccessibilityInfoProps {
  accessibility?: string;
}

export function AccessibilityInfo({ accessibility }: AccessibilityInfoProps) {
  if (!accessibility) {
    return null;
  }

  return (
    <section id="accessibility">
      <h2 className="text-xl font-bold text-park-bark dark:text-park-cream mb-3 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-park-forest"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
        Accessibility
      </h2>
      <div className="bg-white dark:bg-stone-800 rounded-lg p-4 border border-stone-200 dark:border-stone-700">
        <p className="text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
          {accessibility}
        </p>
      </div>
    </section>
  );
}