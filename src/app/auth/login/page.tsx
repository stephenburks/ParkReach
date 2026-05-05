'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { MagicLinkForm } from '@/components/MagicLinkForm'
import { Trees } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
	const { signIn } = useAuth()
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
							<p className="text-sm text-stone-600 dark:text-stone-300">
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
					<>
						<Button onClick={signIn} size="lg" className="w-full">
							Continue with Google
						</Button>

						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<span className="w-full border-t border-stone-200 dark:border-stone-700" />
							</div>
							<div className="relative flex justify-center text-xs">
								<span className="bg-background px-2 text-muted-foreground">
									or sign in with email
								</span>
							</div>
						</div>

						<MagicLinkForm onSent={handleSent} inputId="login-email" />

						<p className="text-center text-sm text-muted-foreground">
							{"Don't have an account? It'll be created automatically"}
						</p>
					</>
				)}
			</div>
		</div>
	)
}
