import type { Metadata } from 'next'
import { ProfileContent } from './ProfileContent'

export const metadata: Metadata = {
	title: 'My Profile | ParkReach',
	robots: { index: false, follow: false },
}

export default function ProfilePage() {
	return <ProfileContent />
}
