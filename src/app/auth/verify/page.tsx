'use client'

import { Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function VerifyPage() {
  const handleResend = async () => {
    const email = new URLSearchParams(window.location.search).get('email')
    const supabase = createClient()
    if (email && supabase) {
      await supabase.auth.signInWithOtp({ email })
      alert('Magic link sent!')
    }
  }

  const email = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('email')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
      <Send className="h-16 w-16 text-primary" />

      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-muted-foreground">
          We sent a magic link to {email || 'your email'}
        </p>
        <p className="text-sm text-muted-foreground">
          Click the link to sign in
        </p>
      </div>

      <button
        onClick={handleResend}
        className="text-sm text-primary hover:underline"
      >
        Resend link
      </button>
    </div>
  )
}