'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { SessionState, RealtimeEvent } from '@/types'

export function useSession(joinCode: string) {
  const [state, setState] = useState<SessionState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchState = useCallback(async () => {
    const res = await fetch(`/api/sessions/${joinCode}`)
    if (!res.ok) { setError('Session not found'); setLoading(false); return }
    const data = await res.json()
    setState(data)
    setLoading(false)
  }, [joinCode])

  useEffect(() => {
    fetchState()
    const interval = setInterval(fetchState, 5000)

    const channel = supabase
      .channel(`session:${joinCode}`)
      .on('broadcast', { event: 'run_started' }, () => fetchState())
      .on('broadcast', { event: 'run_finished' }, () => fetchState())
      .on('broadcast', { event: 'run_dnf' }, () => fetchState())
      .on('broadcast', { event: 'session_finished' }, () => fetchState())
      .subscribe()

    return () => {
      clearInterval(interval)
      supabase.removeChannel(channel)
    }
  }, [joinCode, fetchState])

  return { state, loading, error, refetch: fetchState }
}

export function useRealtimeEvents(joinCode: string, onEvent: (e: RealtimeEvent) => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`session:${joinCode}:events-${Math.random()}`)
      .on('broadcast', { event: 'run_started' }, ({ payload }) =>
        onEvent({ event: 'run_started', payload }))
      .on('broadcast', { event: 'run_finished' }, ({ payload }) =>
        onEvent({ event: 'run_finished', payload }))
      .on('broadcast', { event: 'run_dnf' }, ({ payload }) =>
        onEvent({ event: 'run_dnf', payload }))
      .on('broadcast', { event: 'session_finished' }, ({ payload }) =>
        onEvent({ event: 'session_finished', payload: payload as Record<string, never> }))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [joinCode, onEvent])
}
