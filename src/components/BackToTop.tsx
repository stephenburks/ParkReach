'use client'

import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'

export function BackToTop() {
	const [visible, setVisible] = useState(false)

	useEffect(() => {
		const handleScroll = () => {
			setVisible(window.scrollY > 300)
		}
		window.addEventListener('scroll', handleScroll, { passive: true })
		handleScroll()
		return () => window.removeEventListener('scroll', handleScroll)
	}, [])

	return (
		<button
			type="button"
			onClick={() => {
				const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
				window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' })
			}}
			aria-label="Back to top"
			tabIndex={visible ? 0 : -1}
			className={`
				fixed bottom-6 right-6 z-40
				w-12 h-12 rounded-full
				bg-park-forest text-white
				hover:bg-park-bark
				shadow-lg
				flex items-center justify-center
				focus-visible:ring-2 focus-visible:ring-park-forest focus-visible:ring-offset-2
				focus-visible:outline-none
				motion-safe:transition-all motion-safe:duration-300
				${visible
					? 'opacity-100 translate-y-0 pointer-events-auto'
					: 'opacity-0 translate-y-4 pointer-events-none'
				}
			`}
		>
			<ChevronUp className="h-5 w-5" aria-hidden="true" />
		</button>
	)
}
