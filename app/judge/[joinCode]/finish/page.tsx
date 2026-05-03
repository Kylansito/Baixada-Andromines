'use client'
import { use, useState, useCallback } from 'react'
import { useSession, useRealtimeEvents } from '@/hooks/useSession'
import { formatTime } from '@/lib/format'
import type { RealtimeEvent } from '@/types'

export default function JudgeFinishPage({ params }: { params: Promise<{ joinCode: string }> }) {
  const { joinCode } = use(params)
  const { state, loading, error, refetch } = useSession(joinCode)
  const [busy, setBusy] = useState(false)
  const [lastResult, setLastResult] = useState<{ time: number; name: string; lap: number } | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const onEvent = useCallback((e: RealtimeEvent) => {
    if (e.event === 'run_started' || e.event === 'run_finished' || e.event === 'run_dnf') refetch()
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
      const run = state?.runs.find(r => r.id === runId)
      const name = state?.participants.find(p => p.id === run?.participant_id)?.name ?? ''
      setLastResult({ time: data.elapsed_ms, name, lap: run?.lap ?? 1 })
      refetch()
    }
    setBusy(false)
  }

  async function handleDNF(runId: string) {
    setBusy(true)
    setErr(null)
    const res = await fetch('/api/runs/finish', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ join_code: joinCode, run_id: runId }),
    })
    if (!res.ok) {
      const data = await res.json()
      setErr(data.error)
    } else {
      refetch()
    }
    setBusy(false)
  }

  if (loading) return <Waiting label="Cargando..." />
  if (error || !state) return <Waiting label={error ?? 'Error'} />

  const { participants, runs } = state
  const activeRun = runs.find(r => r.status === 'started')
  const activeName = activeRun ? participants.find(p => p.id === activeRun.participant_id)?.name : null
  const activeNum = activeRun ? participants.find(p => p.id === activeRun.participant_id)?.order_num : null

  if (!activeRun) {
    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-8 gap-4">
        <div className="text-6xl">👁</div>
        <div className="text-xl font-black text-white text-center">Esperando salida...</div>
        <div className="text-gray-500 text-sm text-center">El botón se activará cuando salga un corredor</div>
        {lastResult && (
          <div className="mt-8 bg-green-500/10 border border-green-500/30 rounded-2xl px-6 py-5 text-center">
            <div className="text-xs text-green-400 font-semibold uppercase tracking-wide mb-1">
              {lastResult.name} · Vuelta {lastResult.lap}
            </div>
            <div className="text-4xl font-black font-mono text-green-400">{formatTime(lastResult.time)}</div>
          </div>
        )}
        <div className="mt-8 text-xs text-gray-600">
          <a href={`/admin/${joinCode}`}>Panel admin</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-red-950 flex flex-col px-4 py-8">
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-widest text-red-400">🏆 Juez Llegada</div>
        <div className="text-lg font-black text-white mt-1">{state.session.name}</div>
      </div>

      <div className="bg-white/10 rounded-3xl px-6 py-8 text-center mb-6">
        <div className="text-sm font-bold uppercase tracking-widest text-red-300 mb-1">En camino</div>
        <div className="text-4xl font-black text-white leading-tight">{activeName}</div>
        <div className="text-red-300 text-xl mt-1">#{activeNum} · Vuelta {activeRun.lap}</div>
      </div>

      {err && (
        <div className="bg-red-500/20 text-red-300 rounded-2xl px-4 py-3 text-center font-bold mb-4">{err}</div>
      )}

      {lastResult && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl px-6 py-4 text-center mb-4">
          <div className="text-xs text-green-400 font-semibold mb-1">{lastResult.name} · Vuelta {lastResult.lap} · anterior</div>
          <div className="text-3xl font-black font-mono text-green-400">{formatTime(lastResult.time)}</div>
        </div>
      )}

      <div className="mt-auto space-y-3">
        <button
          onClick={() => handleFinish(activeRun.id)}
          disabled={busy}
          className="w-full bg-red-500 active:bg-red-700 disabled:opacity-50 text-white font-black rounded-3xl py-10 text-5xl shadow-lg transition-all"
        >
          {busy ? '...' : 'LLEGADA'}
        </button>

        <button
          onClick={() => handleDNF(activeRun.id)}
          disabled={busy}
          className="w-full bg-gray-800 active:bg-gray-700 disabled:opacity-50 text-gray-400 font-black rounded-2xl py-4 text-xl transition-all"
        >
          DNF — No ha acabado
        </button>
      </div>

      <div className="mt-4 text-center">
        <a href={`/admin/${joinCode}`} className="text-xs text-red-900">Panel admin</a>
      </div>
    </main>
  )
}

function Waiting({ label }: { label: string }) {
  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-400 text-lg">{label}</p>
    </main>
  )
}
