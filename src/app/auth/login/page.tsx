'use client'

import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Trees } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const { signIn } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <Link
        href="/"
        className="flex items-center gap-2 text-2xl font-bold"
        aria-label="ParkReach home"
      >
        <Trees className="h-8 w-8" />
        ParkReach
      </Link>

      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to save parks and plan your visits
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={signIn} size="lg">
          Continue with Google
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {"Don't have an account? It'll be created automatically"}
      </p>
    </div>
  )
}