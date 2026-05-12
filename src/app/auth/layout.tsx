import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Sign In | ParkReach',
	description: 'Sign in to save and explore national parks',
}

export default function AuthLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return children
}