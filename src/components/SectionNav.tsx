'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

interface SectionLink {
	label: string
	id: string
}

const ALL_SECTIONS: SectionLink[] = [
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

interface SectionNavProps {
	sections?: string[]
}

function getExistingSectionIds(): string[] {
	return ALL_SECTIONS
		.filter((s) => document.getElementById(s.id))
		.map((s) => s.id)
}

export function SectionNav({ sections }: SectionNavProps) {
	const [dynamicIds, setDynamicIds] = useState<string[]>([])
	const [activeId, setActiveId] = useState<string | null>(null)
	const navRef = useRef<HTMLElement>(null)
	const observerRef = useRef<IntersectionObserver | null>(null)

	const visibleSections = useMemo(() => {
		const all = new Set(sections ?? [])
		for (const id of dynamicIds) all.add(id)
		return ALL_SECTIONS.filter((s) => all.has(s.id))
	}, [sections, dynamicIds])

	// Detect sections that appear in the DOM (client-side data loads)
	useEffect(() => {
		const container = document.getElementById('park-info-grid')
		if (!container) return

		const check = () => {
			const existing = getExistingSectionIds()
			setDynamicIds((prev) => {
				if (existing.every((id) => prev.includes(id)) && prev.every((id) => existing.includes(id))) return prev
				return existing
			})
		}

		// Initial check after client components have mounted
		check()
		const timer = setTimeout(check, 1000)

		const observer = new MutationObserver(check)
		observer.observe(container, { childList: true, subtree: true })

		return () => {
			clearTimeout(timer)
			observer.disconnect()
		}
	}, [])

	const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
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

		for (const section of visibleSections) {
			const el = document.getElementById(section.id)
			if (el) {
				observerRef.current.observe(el)
				elements.push(el)
			}
		}

		return () => {
			observerRef.current?.disconnect()
		}
	}, [handleIntersection, visibleSections])

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault()
		const id = e.currentTarget.getAttribute('href')?.slice(1)
		if (!id) return

		const el = document.getElementById(id)
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' })
			el.setAttribute('tabindex', '-1')
			el.focus({ preventScroll: true })
			setActiveId(id)
		}
	}

	if (visibleSections.length === 0) return null

	return (
		<nav
			ref={navRef}
			aria-label="Page sections"
			className="sticky top-0 z-30 bg-park-cream/95 dark:bg-park-bark/95 backdrop-blur-md"
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<ul
					className="flex gap-0.5 overflow-x-auto scrollbar-hide py-2"
					role="list"
				>
					{visibleSections.map((section) => {
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
