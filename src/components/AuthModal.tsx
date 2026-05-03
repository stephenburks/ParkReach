'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { X, Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const handleClose = useCallback(() => {
    setEmail('')
    setMagicLinkSent(false)
    onClose()
  }, [onClose])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      handleClose()
      return
    }

    if (e.key !== 'Tab' || !modalRef.current) return

    const focusable = Array.from(
      modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)

    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [isOpen, handleClose])

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null
      closeButtonRef.current?.focus()
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      triggerRef.current?.focus()
    }
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      await createClient().auth.signInWithOtp({ email })
      setMagicLinkSent(true)
    } catch (error) {
      console.error('Magic link error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div ref={modalRef} className="relative bg-white dark:bg-stone-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 animate-in fade-in zoom-in-95 duration-200">
        <Button
          ref={closeButtonRef}
          variant="ghost"
          size="sm"
        onClick={handleClose}
          className="absolute top-4 right-4"
          aria-label="Close sign in dialog"
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="text-center">
          <h2 id="auth-modal-title" className="text-2xl font-semibold mb-2 dark:text-park-cream">
            Welcome to ParkReach
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mb-6">
            Sign in to save parks and plan your visits
          </p>

          {magicLinkSent ? (
            <div className="space-y-3">
              <div className="p-4 bg-stone-100 dark:bg-stone-700 rounded-lg">
                <p className="text-sm text-stone-600 dark:text-stone-300">
                  Check <strong>{email}</strong> for your magic link
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setMagicLinkSent(false)}
                className="w-full"
              >
                Use different email
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <Button onClick={signIn} size="lg" className="w-full">
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-stone-200 dark:border-stone-600" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white dark:bg-stone-800 px-2 text-stone-400">or sign in with email</span>
                  </div>
                </div>

                <form onSubmit={handleMagicLink} className="space-y-3">
                  <input
                    ref={emailInputRef}
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-700 text-park-bark dark:text-park-cream rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-park-forest/50"
                    required
                  />
                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Magic Link
                      </>
                    )}
                  </Button>
                </form>
              </div>

              <p className="text-xs text-stone-400 dark:text-stone-500 mt-6">
                {"Don't have an account? It'll be created automatically"}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}