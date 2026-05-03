'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

type DarkModeContextType = {
	isDark: boolean
	toggle: () => void
}

const DarkModeContext = createContext<DarkModeContextType>({
	isDark: false,
	toggle: () => {},
})

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
	const [isDark, setIsDark] = useState(false)
	const { user, supabase } = useAuth()

	useEffect(() => {
		let cancelled = false

		if (user && supabase) {
			supabase
				.from('profiles')
				.select('dark_mode')
				.eq('id', user.id)
				.single()
				.then(({ data, error }) => {
					if (cancelled) return

					if (error) {
						console.error(error)
						const stored = localStorage.getItem('darkMode')
						if (stored !== null) {
							setIsDark(stored === 'true')
						}
					} else {
						const darkMode = data?.dark_mode ?? false
						setIsDark(darkMode)
						localStorage.setItem('darkMode', String(darkMode))
					}
				})
		} else {
			const stored = localStorage.getItem('darkMode')
			const shouldDark = stored !== null
				? stored === 'true'
				: window.matchMedia('(prefers-color-scheme: dark)').matches

			queueMicrotask(() => {
				if (!cancelled) {
					setIsDark(shouldDark)
				}
			})
		}

		return () => {
			cancelled = true
		}
	}, [user, supabase])

	useEffect(() => {
		localStorage.setItem('darkMode', String(isDark))
		document.documentElement.classList.toggle('dark', isDark)
	}, [isDark])

	const toggle = useCallback(() => {
		setIsDark((prev) => {
			const next = !prev
			if (user && supabase) {
				supabase
					.from('profiles')
					.update({ dark_mode: next })
					.eq('id', user.id)
					.then(({ error }) => {
						if (error) console.error(error)
					})
			}
			return next
		})
	}, [user, supabase])

	const value = useMemo(() => ({ isDark, toggle }), [isDark, toggle])

	return (
		<DarkModeContext.Provider value={value}>
			{children}
		</DarkModeContext.Provider>
	)
}

export function useDarkMode() {
	return useContext(DarkModeContext)
}
