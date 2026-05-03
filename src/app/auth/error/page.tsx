'use client'

import { Suspense } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter, useSearchParams } from 'next/navigation'

function ErrorContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const message = searchParams.get('message') ?? 'Something went wrong'

	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4">
			<AlertCircle className="h-16 w-16 text-destructive" />

			<div className="flex flex-col items-center gap-4 text-center">
				<h1 className="text-2xl font-semibold">Sign in failed</h1>
				<p className="text-muted-foreground">{message}</p>
			</div>

			<div className="flex gap-3">
				<Button onClick={() => router.push('/auth/login')}>Try again</Button>
				<Button variant="ghost" onClick={() => router.push('/')}>Go home</Button>
			</div>
		</div>
	)
}

export default function ErrorPage() {
	return (
		<Suspense>
			<ErrorContent />
		</Suspense>
	)
}
