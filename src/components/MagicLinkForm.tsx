'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MagicLinkFormProps {
	onSent: (email: string) => void
	inputId?: string
}

export function MagicLinkForm({ onSent, inputId = 'magic-link-email' }: MagicLinkFormProps) {
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const { supabase } = useAuth()

	const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		if (!email) return

		if (!isValidEmail(email)) {
			setError('Please enter a valid email address.')
			return
		}

		if (!supabase) return

		setError(null)
		setLoading(true)
		try {
			const { error: supabaseError } = await supabase.auth.signInWithOtp({ email })
			if (supabaseError) {
				setError('Failed to send email — please try again.')
				return
			}
			onSent(email)
		} catch {
			setError('Failed to send email — please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			<label htmlFor={inputId} className="sr-only">Email address</label>
			<input
				id={inputId}
				type="email"
				placeholder="your@email.com"
				value={email}
				onChange={(event) => { setEmail(event.target.value); setError(null) }}
				className="w-full px-4 py-3 border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-park-bark dark:text-park-cream rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-park-forest/50"
				required
			/>
			{error && (
				<p role="alert" className="text-sm text-red-500 dark:text-red-400">{error}</p>
			)}
			<Button type="submit" size="lg" className="w-full" disabled={loading}>
				{loading ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<>
						<Mail className="mr-2 h-4 w-4" />
						Send Email Code
					</>
				)}
			</Button>
		</form>
	)
}
