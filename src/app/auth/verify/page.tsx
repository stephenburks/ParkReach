'use client'

import { Suspense } from 'react'
import { Send } from 'lucide-react'
import { VerifyContent } from './VerifyContent'

export default function VerifyPage() {
	return (
		<Suspense fallback={
			<div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
				<Send className="h-16 w-16 text-park-forest" />
				<p className="text-stone-500">Loading…</p>
			</div>
		}>
			<VerifyContent />
		</Suspense>
	)
}
