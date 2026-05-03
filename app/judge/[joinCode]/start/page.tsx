'use client'
import { use, useState, useCallback } from 'react'
import { useSession, useRealtimeEvents } from '@/hooks/useSession'
import type { Participant, RealtimeEvent } from '@/types'

export default function JudgeStartPage({ params }: { params: Promise<{ joinCode: string }> }) {
  const { joinCode } = use(params)
  const { state, loading, error, refetch } = useSession(joinCode)
  const [selectedId, setSelectedId] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const onEvent = useCallback((e: RealtimeEvent) => {
    if (e.event === 'run_finished' || e.event === 'run_dnf') {
      refetch()
      setFeedback(null)
    }
  }, [refetch])

  useRealtimeEvents(joinCode, onEvent)

  async function handleStart() {
    if (!selectedId) return
    setBusy(true)
    setFeedback(null)
    const res = await fetch('/api/runs/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ join_code: joinCode, participant_id: selectedId }),
    })
    const data = await res.json()
    if (!res.ok) {
      setFeedback({ msg: data.error, type: 'err' })
    } else {
      const name = state?.participants.find(p => p.id === selectedId)?.name ?? ''
      setFeedback({ msg: `¡${name} ha salido!`, type: 'ok' })
      setSelectedId('')
      refetch()
    }
    setBusy(false)
  }

  if (loading) return <FullScreen color="gray"><p className="text-gray-400 text-xl">Cargando...</p></FullScreen>
  if (error || !state) return <FullScreen color="gray"><p className="text-red-400 text-xl">{error ?? 'Error'}</p></FullScreen>

  const { participants, runs } = state
  const doneIds = new Set(runs.filter(r => r.status !== 'pending').map(r => r.participant_id))
  const activeRun = runs.find(r => r.status === 'started')
  const pending: Participant[] = participants.filter(p => !doneIds.has(p.id)).sort((a, b) => a.order_num - b.order_num)

  if (activeRun) {
    const name = participants.find(p => p.id === activeRun.participant_id)?.name
    return (
      <FullScreen color="yellow">
        <div className="text-6xl mb-4">⏱</div>
        <div className="text-2xl font-black text-black text-center">{name}</div>
        <div className="text-black/60 font-semibold text-center">En pista — espera a que llegue</div>
        <div className="mt-8 text-sm text-black/40 text-center">
          <a href={`/admin/${joinCode}`}>Panel admin</a>
        </div>
      </FullScreen>
    )
  }

  if (pending.length === 0) {
    return (
      <FullScreen color="gray">
        <div className="text-5xl mb-4">✅</div>
        <div className="text-2xl font-black text-white text-center">Todos han bajado</div>
        <div className="mt-8 text-sm text-gray-400 text-center">
          <a href={`/admin/${joinCode}`}>Panel admin</a>
        </div>
      </FullScreen>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">🏁 Juez Salida</div>
        <div className="text-lg font-black text-white mt-1">{state.session.name}</div>
      </div>

      {/* Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-400 mb-3">Selecciona el siguiente corredor</label>
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {pending.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`w-full flex items-center gap-4 rounded-2xl px-5 py-4 transition-all text-left ${
                selectedId === p.id
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-white active:bg-gray-700'
              }`}
            >
              <span className={`font-black text-xl w-10 text-center ${selectedId === p.id ? 'text-white' : 'text-gray-400'}`}>
                #{p.order_num}
              </span>
              <span className="font-bold text-lg">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`rounded-2xl px-4 py-3 text-center font-bold mb-4 ${feedback.type === 'ok' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {feedback.msg}
        </div>
      )}

      {/* Big button */}
      <div className="mt-auto">
        <button
          onClick={handleStart}
          disabled={!selectedId || busy}
          className="w-full bg-green-500 active:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-black rounded-3xl py-8 text-4xl shadow-lg transition-all"
        >
          {busy ? '...' : 'SALIDA'}
        </button>
      </div>

      <div className="mt-4 text-center">
        <a href={`/admin/${joinCode}`} className="text-xs text-gray-600">Panel admin</a>
      </div>
    </main>
  )
}

function FullScreen({ children, color }: { children: React.ReactNode; color: 'yellow' | 'gray' }) {
  const bg = color === 'yellow' ? 'bg-yellow-400' : 'bg-gray-950'
  return (
    <main className={`min-h-screen ${bg} flex flex-col items-center justify-center px-8 gap-4`}>
      {children}
    </main>
  )
}
