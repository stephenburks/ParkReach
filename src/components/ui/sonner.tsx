'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'
import { useDarkMode } from '@/components/DarkModeProvider'

export function Toaster(props: ToasterProps) {
	const { isDark } = useDarkMode()
	return <Sonner theme={isDark ? 'dark' : 'light'} position="bottom-right" {...props} />
}
