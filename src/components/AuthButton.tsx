'use client'

import { useAuth } from '@/context/AuthContext'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AuthButtonProps {
  onSignInClick: () => void
}

export function AuthButton({ onSignInClick }: AuthButtonProps) {
  const { user, signOut, loading } = useAuth()

  if (loading) {
    return <div className="w-20 h-8 rounded-md bg-white/20 animate-pulse" />
  }

  if (user) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={signOut}
        aria-label="Sign out"
        className="text-white hover:bg-white/20 dark:text-stone-300 dark:hover:bg-stone-700"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    )
  }

  return (
    <Button 
      variant="default" 
      size="sm" 
      onClick={onSignInClick}
      className="bg-park-cream text-park-bark hover:bg-white dark:bg-park-bark dark:text-park-cream dark:hover:bg-stone-700"
    >
      <User className="mr-2 h-4 w-4" />
      Sign in
    </Button>
  )
}