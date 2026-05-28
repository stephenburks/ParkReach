'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, User, LogOut } from 'lucide-react'
import { AuthButton } from '@/components/AuthButton'
import { AuthModal } from '@/components/AuthModal'
import { DarkModeToggle } from '@/components/DarkModeToggle'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export function HeaderControls() {
	const [showAuthModal, setShowAuthModal] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)
	const { user, signOut } = useAuth()

	return (
		<>
			{/* Desktop controls */}
			<div className="hidden sm:flex items-center gap-2">
				<AuthButton onSignInClick={() => setShowAuthModal(true)} />
				<DarkModeToggle />
			</div>

			{/* Mobile hamburger */}
			<div className="flex sm:hidden items-center gap-2">
				<DarkModeToggle />
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setMenuOpen((prev) => !prev)}
					aria-label={menuOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={menuOpen}
					className="text-white hover:bg-white/20"
				>
					{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
				</Button>
			</div>

			{/* Mobile drawer */}
			{menuOpen && (
				<div className="absolute top-full left-0 right-0 bg-park-forest border-t border-white/10 shadow-lg z-50 sm:hidden">
					<nav className="max-w-full lg:max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
						{user ? (
							<>
								<Link
									href="/profile"
									onClick={() => setMenuOpen(false)}
									className="flex items-center gap-3 px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors"
								>
									<User className="h-4 w-4 shrink-0" />
									Profile
								</Link>
								<button
									onClick={() => { signOut(); setMenuOpen(false) }}
									className="flex items-center gap-3 px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors text-left w-full"
								>
									<LogOut className="h-4 w-4 shrink-0" />
									Sign out
								</button>
							</>
						) : (
							<button
								onClick={() => { setMenuOpen(false); setShowAuthModal(true) }}
								className="flex items-center gap-3 px-3 py-2.5 text-white hover:bg-white/10 rounded-lg transition-colors text-left w-full"
							>
								<User className="h-4 w-4 shrink-0" />
								Sign in
							</button>
						)}
					</nav>
				</div>
			)}

			<AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
		</>
	)
}
