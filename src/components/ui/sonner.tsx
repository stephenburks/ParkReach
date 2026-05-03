'use client'

import { useEffect, useState } from 'react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

export function Toaster(props: ToasterProps) {
	const [theme, setTheme] = useState<'light' | 'dark'>('light')

	useEffect(() => {
		const root = document.documentElement
		const sync = () => setTheme(root.classList.contains('dark') ? 'dark' : 'light')
		sync()
		const observer = new MutationObserver(sync)
		observer.observe(root, { attributes: true, attributeFilter: ['class'] })
		return () => observer.disconnect()
	}, [])

	return <Sonner theme={theme} position="bottom-right" {...props} />
}
