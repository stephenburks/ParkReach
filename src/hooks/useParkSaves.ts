'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

type ParkSave = {
  id: string
  user_id: string
  park_code: string
  wishlisted: boolean
  visited: boolean
  created_at: string
}

export function useSaves() {
  const [saves, setSaves] = useState<ParkSave[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchSaves = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('park_saves')
        .select('*')
        .eq('user_id', user.id)

      if (!error && data) {
        setSaves(data)
      }
      setLoading(false)
    }

    fetchSaves()
  }, [supabase])

  const toggleWishlist = async (parkCode: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const existing = saves.find((s) => s.park_code === parkCode)
    if (existing) {
      const { error } = await supabase
        .from('park_saves')
        .update({ wishlisted: !existing.wishlisted })
        .eq('id', existing.id)
      if (!error) {
        setSaves((prev) =>
          prev.map((s) =>
            s.id === existing.id ? { ...s, wishlisted: !s.wishlisted } : s
          )
        )
      }
    } else {
      const { data, error } = await supabase
        .from('park_saves')
        .insert({ user_id: user.id, park_code: parkCode, wishlisted: true })
        .select()
        .single()
      if (!error && data) {
        setSaves((prev) => [...prev, data])
      }
    }
  }

  const toggleVisited = async (parkCode: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const existing = saves.find((s) => s.park_code === parkCode)
    if (existing) {
      const { error } = await supabase
        .from('park_saves')
        .update({ visited: !existing.visited })
        .eq('id', existing.id)
      if (!error) {
        setSaves((prev) =>
          prev.map((s) =>
            s.id === existing.id ? { ...s, visited: !s.visited } : s
          )
        )
      }
    } else {
      const { data, error } = await supabase
        .from('park_saves')
        .insert({ user_id: user.id, park_code: parkCode, visited: true })
        .select()
        .single()
      if (!error && data) {
        setSaves((prev) => [...prev, data])
      }
    }
  }

  const isWishlisted = (parkCode: string) =>
    saves.some((s) => s.park_code === parkCode && s.wishlisted)

  const isVisited = (parkCode: string) =>
    saves.some((s) => s.park_code === parkCode && s.visited)

  return {
    saves,
    loading,
    toggleWishlist,
    toggleVisited,
    isWishlisted,
    isVisited,
  }
}