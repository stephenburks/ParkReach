'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSaves } from '@/hooks/useParkSaves'
import { AuthButton } from '@/components/AuthButton'
import { AuthModal } from '@/components/AuthModal'
import { Park } from '@/types/park'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { saves, loading } = useSaves()
  const [showAuthModal, setShowAuthModal] = useState(false)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-park-cream dark:bg-park-bark p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded w-32" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-stone-800 rounded-2xl h-64" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-park-cream dark:bg-park-bark flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-2">Sign in to view your profile</h1>
          <p className="text-stone-500 mb-6">
            Save parks and track visits by signing in
          </p>
          <AuthButton onSignInClick={() => setShowAuthModal(true)} />
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    )
  }

  const wishlisted = saves.filter((s) => s.wishlisted)
  const visited = saves.filter((s) => s.visited)

  const ParkRow = ({ parkCode }: { parkCode: string }) => (
    <Link
      href={`/parks/${parkCode}`}
      className="block p-4 bg-white dark:bg-stone-800 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
    >
      <span className="font-medium">{parkCode}</span>
    </Link>
  )

  return (
    <div className="min-h-screen bg-park-cream dark:bg-park-bark p-8">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-stone-500 dark:text-stone-400">{user.email}</p>
      </header>

      <section className="max-w-4xl mx-auto mb-12">
        <h2 className="text-xl font-semibold mb-4">Wishlist ({wishlisted.length})</h2>
        {wishlisted.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlisted.map((save) => (
              <ParkRow key={save.id} parkCode={save.park_code} />
            ))}
          </div>
        ) : (
          <p className="text-stone-500">No wishlisted parks yet.</p>
        )}
        <Link href="/" className="inline-block mt-4 text-park-forest hover:underline">
          Explore parks to add to your wishlist
        </Link>
      </section>

      <section className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Visited ({visited.length})</h2>
        {visited.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visited.map((save) => (
              <ParkRow key={save.id} parkCode={save.park_code} />
            ))}
          </div>
        ) : (
          <p className="text-stone-500">No visited parks yet.</p>
        )}
        <Link href="/" className="inline-block mt-4 text-park-forest hover:underline">
          Start exploring
        </Link>
      </section>
    </div>
  )
}