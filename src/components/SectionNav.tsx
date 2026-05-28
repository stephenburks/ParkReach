'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface SectionLink {
	label: string
	id: string
}

const SECTIONS: SectionLink[] = [
	{ label: 'About', id: 'about' },
	{ label: 'Weather', id: 'weather' },
	{ label: 'Accessibility', id: 'accessibility' },
	{ label: 'Directions', id: 'directions' },
	{ label: 'Fees', id: 'fees' },
	{ label: 'Hours', id: 'hours' },
	{ label: 'Things To Do', id: 'things-to-do' },
	{ label: 'Activities', id: 'activities' },
	{ label: 'Events', id: 'events' },
	{ label: 'Campgrounds', id: 'campgrounds' },
	{ label: 'Visitor Centers', id: 'visitor-centers' },
	{ label: 'News', id: 'news' },
	{ label: 'Topics', id: 'topics' },
]

export function SectionNav() {
	const [activeId, setActiveId] = useState<string | null>(null)
	const navRef = useRef<HTMLElement>(null)
	const observerRef = useRef<IntersectionObserver | null>(null)

	const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
		// Find the first section whose top is in the upper portion of the viewport
		for (const entry of entries) {
			if (entry.isIntersecting) {
				setActiveId(entry.target.id)
				break
			}
		}
	}, [])

	useEffect(() => {
		observerRef.current = new IntersectionObserver(handleIntersection, {
			rootMargin: '-15% 0px -75% 0px',
			threshold: 0,
		})

		const elements: Element[] = []

		for (const section of SECTIONS) {
			const el = document.getElementById(section.id)
			if (el) {
				observerRef.current.observe(el)
				elements.push(el)
			}
		}

		return () => {
			observerRef.current?.disconnect()
		}
	}, [handleIntersection])

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault()
		const id = e.currentTarget.getAttribute('href')?.slice(1)
		if (!id) return

		const el = document.getElementById(id)
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' })
			// Set focus to the section for keyboard users
			el.setAttribute('tabindex', '-1')
			el.focus({ preventScroll: true })
			// Update active immediately for click
			setActiveId(id)
		}
	}

	return (
		<nav
			ref={navRef}
			aria-label="Page sections"
			className="sticky top-0 z-30 bg-park-cream/95 dark:bg-park-bark/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-700 -mx-4 sm:-mx-6 lg:-mx-8"
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<ul
					className="flex gap-0.5 overflow-x-auto scrollbar-hide py-2"
					role="list"
				>
					{SECTIONS.map((section) => {
						const isActive = activeId === section.id
						return (
							<li key={section.id} className="shrink-0">
								<a
									href={`#${section.id}`}
									onClick={handleClick}
									className={`block px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest focus-visible:ring-offset-2 dark:focus-visible:ring-offset-park-bark ${
										isActive
											? 'bg-park-forest text-white'
											: 'text-park-stone dark:text-stone-400 hover:text-park-bark dark:hover:text-park-cream hover:bg-stone-200/50 dark:hover:bg-stone-700/50'
									}`}
								>
									{section.label}
								</a>
							</li>
						)
					})}
				</ul>
			</div>
		</nav>
	)
}
