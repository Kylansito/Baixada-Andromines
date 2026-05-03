'use client'
import { use, useState, useCallback } from 'react'
import { useSession, useRealtimeEvents } from '@/hooks/useSession'
import BigButton from '@/components/BigButton'
import { formatTime } from '@/lib/format'
import type { RealtimeEvent } from '@/types'

export default function JudgeFinishPage({ params }: { params: Promise<{ joinCode: string }> }) {
  const { joinCode } = use(params)
  const { state, loading, error, refetch } = useSession(joinCode)
  const [busy, setBusy] = useState(false)
  const [lastTime, setLastTime] = useState<number | null>(null)
  const [lastName, setLastName] = useState<string>('')
  const [err, setErr] = useState<string | null>(null)

  const onEvent = useCallback((e: RealtimeEvent) => {
    if (e.event === 'run_started' || e.event === 'run_finished' || e.event === 'run_dnf') {
      refetch()
    }
  }, [refetch])

  useRealtimeEvents(joinCode, onEvent)

  async function handleFinish(runId: string) {
    setBusy(true)
    setErr(null)
    const res = await fetch('/api/runs/finish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ join_code: joinCode, run_id: runId }),
    })
    const data = await res.json()
    if (!res.ok) {
      setErr(data.error)
    } else {
      setLastTime(data.elapsed_ms)
      const name = state?.participants.find(p => {
        const run = state.runs.find(r => r.id === runId)
        return run && p.id === run.participant_id
      })?.name ?? ''
      setLastName(name)
      refetch()
    }
    setBusy(false)
  }

  if (loading) return <Screen><p className="text-gray-400 text-center">Cargando...</p></Screen>
  if (error || !state) return <Screen><p className="text-red-500 text-center">{error ?? 'Error'}</p></Screen>

  const { participants, runs } = state
  const activeRun = runs.find(r => r.status === 'started')
  const activeName = activeRun ? participants.find(p => p.id === activeRun.participant_id)?.name : null

  return (
    <Screen>
      <div className="text-center mb-2">
        <div className="text-4xl">🏆</div>
        <h1 className="text-2xl font-black text-gray-900">Juez Llegada</h1>
        <p className="text-sm text-gray-500">{state.session.name}</p>
      </div>

      {!activeRun && !lastTime && (
        <div className="bg-gray-100 rounded-xl px-4 py-8 text-center text-gray-500">
          Esperando que salga un participante...
        </div>
      )}

      {activeRun && (
        <>
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl px-4 py-6 text-center">
            <p className="text-sm text-yellow-600 font-semibold uppercase tracking-wide mb-1">En camino</p>
            <p className="text-3xl font-black text-gray-900">{activeName}</p>
          </div>

          <BigButton
            label="LLEGADA"
            onClick={() => handleFinish(activeRun.id)}
            loading={busy}
            color="red"
          />
        </>
      )}

      {err && (
        <div className="bg-red-100 text-red-700 rounded-xl px-4 py-3 text-center font-semibold">{err}</div>
      )}

      {lastTime !== null && (
        <div className="bg-green-50 border border-green-300 rounded-2xl px-4 py-6 text-center">
          <p className="text-sm text-green-600 font-semibold uppercase mb-1">{lastName} · Tiempo</p>
          <p className="text-5xl font-black font-mono text-green-700">{formatTime(lastTime)}</p>
        </div>
      )}

      <div className="text-center">
        <a href={`/admin/${joinCode}`} className="text-sm text-gray-400 underline">Panel admin</a>
      </div>
    </Screen>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white px-4 py-8 max-w-md mx-auto flex flex-col gap-6 justify-center">
      {children}
    </main>
  )
}
