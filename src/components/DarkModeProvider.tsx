'use client'

import { createContext, useContext, useEffect, useState } from 'react'

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) {
      setIsDark(stored === 'true')
    } else {
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem('darkMode', String(isDark))
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark, mounted])

  const toggle = () => setIsDark((prev) => !prev)

  return (
    <DarkModeContext.Provider value={{ isDark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  return useContext(DarkModeContext)
}