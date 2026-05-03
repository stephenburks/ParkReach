'use client'

import { useState } from 'react'
import { AuthButton } from '@/components/AuthButton'
import { AuthModal } from '@/components/AuthModal'
import { DarkModeToggle } from '@/components/DarkModeToggle'

export function HeaderControls() {
	const [showAuthModal, setShowAuthModal] = useState(false)
	return (
		<>
			<AuthButton onSignInClick={() => setShowAuthModal(true)} />
			<DarkModeToggle />
			<AuthModal
				isOpen={showAuthModal}
				onClose={() => setShowAuthModal(false)}
			/>
		</>
	)
}
