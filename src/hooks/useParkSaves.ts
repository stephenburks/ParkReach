'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';

type ParkSave = {
  id: string;
  user_id: string;
  park_code: string;
  wishlisted: boolean;
  visited: boolean;
  created_at: string;
}

export function useSaves() {
  const [saves, setSaves] = useState<ParkSave[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchSaves = useCallback(async () => {
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
  }, [user])

  useEffect(() => {
    fetchSaves()
  }, [fetchSaves])

  const toggleWishlist = async (parkCode: string) => {
    if (!user) return false

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
      return !error
    } else {
      const { data, error } = await supabase
        .from('park_saves')
        .insert({ user_id: user.id, park_code: parkCode, wishlisted: true })
        .select()
        .single()
      if (!error && data) {
        setSaves((prev) => [...prev, data])
      }
      return !error
    }
    return false
  }

  const toggleVisited = async (parkCode: string) => {
    if (!user) return false

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
      return !error
    } else {
      const { data, error } = await supabase
        .from('park_saves')
        .insert({ user_id: user.id, park_code: parkCode, visited: true })
        .select()
        .single()
      if (!error && data) {
        setSaves((prev) => [...prev, data])
      }
      return !error
    }
    return false
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
    isAuthenticated: !!user,
  }
}