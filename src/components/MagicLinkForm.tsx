'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MagicLinkFormProps {
	onSent: (email: string) => void
	inputId?: string
}

export function MagicLinkForm({ onSent, inputId = 'magic-link-email' }: MagicLinkFormProps) {
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()
		if (!email) return

		const supabase = createClient()
		if (!supabase) return

		setLoading(true)
		try {
			await supabase.auth.signInWithOtp({ email })
			onSent(email)
		} catch (error) {
			console.error('Magic link error:', error)
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
				onChange={(event) => setEmail(event.target.value)}
				className="w-full px-4 py-3 border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-park-bark dark:text-park-cream rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-park-forest/50"
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
	)
}
