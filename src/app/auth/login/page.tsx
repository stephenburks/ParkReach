'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { MagicLinkForm } from '@/components/MagicLinkForm'
import { Trees } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
	useAuth()
	const [magicLinkSent, setMagicLinkSent] = useState(false)
	const [sentEmail, setSentEmail] = useState('')

	const handleSent = (email: string) => {
		setSentEmail(email)
		setMagicLinkSent(true)
	}

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

			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="text-3xl font-semibold">Welcome to ParkReach</h1>
				<p className="text-muted-foreground">
					Sign in to save parks and plan your visits
				</p>
			</div>

			<div className="w-full max-w-sm space-y-3">
				{magicLinkSent ? (
					<div className="space-y-3">
						<div className="p-4 bg-stone-100 dark:bg-stone-800 rounded-lg text-center">
							<p className="text-sm text-stone-700 dark:text-stone-300">
								Check <strong>{sentEmail}</strong> for your magic link
							</p>
						</div>
						<Button
							variant="outline"
							onClick={() => setMagicLinkSent(false)}
							className="w-full"
						>
							Use a different email
						</Button>
					</div>
				) : (
					<MagicLinkForm onSent={handleSent} inputId="login-email" />

				)}
			</div>
		</div>
	)
}
