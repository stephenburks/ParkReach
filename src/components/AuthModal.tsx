'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MagicLinkForm } from '@/components/MagicLinkForm'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [sentEmail, setSentEmail] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const backButtonRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  const handleClose = useCallback(() => {
    setSentEmail('')
    setMagicLinkSent(false)
    onClose()
  }, [onClose])

  useFocusTrap(modalRef, isOpen)

  useEffect(() => {
    if (magicLinkSent) {
      backButtonRef.current?.focus()
    }
  }, [magicLinkSent])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) handleClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleClose])

  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null
      closeButtonRef.current?.focus()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      triggerRef.current?.focus()
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSent = (email: string) => {
    setSentEmail(email)
    setMagicLinkSent(true)
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
                <p className="text-sm text-stone-700 dark:text-stone-300">
                  Check <strong>{sentEmail}</strong> for your sign-in link
                </p>
              </div>
              <Button
                ref={backButtonRef}
                variant="outline"
                onClick={() => setMagicLinkSent(false)}
                className="w-full"
              >
                Use different email
              </Button>
            </div>
          ) : (
            <MagicLinkForm onSent={handleSent} inputId="auth-modal-email" />
          )}
        </div>
      </div>
    </div>
  )
}