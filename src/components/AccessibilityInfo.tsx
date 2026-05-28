import { Accessibility, Eye, Ear, Languages, Star } from 'lucide-react'
import type { Park } from '@/types/park'

interface AccessibilityInfoProps {
	accessibility?: string
	park?: Pick<Park, 'has_wheelchair_access' | 'has_braille' | 'has_asl' | 'has_audio_description' | 'has_accessible_restrooms' | 'has_service_animal_relief'>
}

const FLAGS: Array<{ key: keyof NonNullable<AccessibilityInfoProps['park']>; label: string; icon: typeof Accessibility }> = [
	{ key: 'has_wheelchair_access', label: 'Wheelchair Access', icon: Accessibility },
	{ key: 'has_braille', label: 'Braille', icon: Eye },
	{ key: 'has_asl', label: 'ASL', icon: Languages },
	{ key: 'has_audio_description', label: 'Audio Description', icon: Ear },
	{ key: 'has_accessible_restrooms', label: 'Accessible Restrooms', icon: Star },
	{ key: 'has_service_animal_relief', label: 'Service Animal Relief', icon: Star },
]

export function AccessibilityInfo({ accessibility, park }: AccessibilityInfoProps) {
	const hasFlags = park && FLAGS.some((f) => park[f.key])
	const hasText = Boolean(accessibility)

	if (!hasFlags && !hasText) return null

	return (
		<section id="accessibility" className="scroll-mt-24">
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

			{hasFlags && (
				<div className="flex flex-wrap gap-2 mb-4">
					{FLAGS.map(({ key, label, icon: Icon }) => {
						if (!park?.[key]) return null
						return (
							<span
								key={key}
								className="inline-flex items-center gap-1.5 text-xs bg-park-sage/15 dark:bg-park-sage/25 text-park-bark dark:text-park-cream px-3 py-1.5 rounded-full"
							>
								<Icon className="h-3.5 w-3.5" aria-hidden="true" />
								{label}
							</span>
						)
					})}
				</div>
			)}

			{hasText && (
				<div className="bg-white dark:bg-stone-800 rounded-xl p-4 border border-stone-200 dark:border-stone-700 shadow-sm">
					<p className="text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
						{accessibility}
					</p>
				</div>
			)}
		</section>
	)
}
