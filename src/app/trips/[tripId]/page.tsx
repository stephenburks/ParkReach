import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { TripContent } from './TripContent'

interface Props {
	params: Promise<{ tripId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { tripId } = await params
	const supabase = await createClient()
	if (!supabase) return { title: 'Trip | ParkReach' }

	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { title: 'Trip | ParkReach' }

	const { data: trip } = await supabase
		.from('trips')
		.select('name')
		.eq('id', tripId)
		.eq('user_id', user.id)
		.single()

	return {
		title: trip ? `${trip.name} | ParkReach` : 'Trip | ParkReach',
		robots: { index: false, follow: false },
	}
}

export default async function TripPage({ params }: Props) {
	const { tripId } = await params
	const supabase = await createClient()

	if (!supabase) notFound()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) notFound()

	const { data: trip } = await supabase
		.from('trips')
		.select('id')
		.eq('id', tripId)
		.eq('user_id', user.id)
		.single()

	if (!trip) notFound()

	return (
		<ErrorBoundary>
			<TripContent tripId={tripId} />
		</ErrorBoundary>
	)
}
