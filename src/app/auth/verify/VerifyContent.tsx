'use client'

import { useSearchParams } from 'next/navigation'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

export function VerifyContent() {
	const { supabase } = useAuth()
	const searchParams = useSearchParams()
	const email = searchParams.get('email')

	const handleResend = async () => {
		if (!email) return
		if (!supabase) return
		const { error } = await supabase.auth.signInWithOtp({ email })
		if (error) {
			toast.error('Failed to resend — please try again.')
		} else {
			toast.success('Email code resent!')
		}
	}

	return (
		<main id="main-content" className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
			<Send className="h-16 w-16 text-park-forest" />

			<div className="flex flex-col items-center gap-4 text-center">
				<h1 className="text-2xl font-semibold">Check your email</h1>
				<p className="text-stone-500 dark:text-stone-400">
					We sent a sign-in code to{' '}
					{email ? <strong className="text-park-bark dark:text-park-cream">{email}</strong> : 'your email'}
				</p>
				<p className="text-sm text-stone-400">
					Click the link in the email to sign in.
				</p>
			</div>

			<button
				onClick={handleResend}
				className="text-sm text-park-forest hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-park-forest rounded"
			>
				Resend code
			</button>
		</main>
	)
}
