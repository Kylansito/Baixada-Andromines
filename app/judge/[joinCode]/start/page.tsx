'use client'
import { use, useState, useCallback } from 'react'
import { useSession, useRealtimeEvents } from '@/hooks/useSession'
import { formatTime } from '@/lib/format'
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
      setFeedback({ msg: `¡${name} ha salido! Vuelta ${data.lap}`, type: 'ok' })
      setSelectedId('')
      refetch()
    }
    setBusy(false)
  }

  if (loading) return <FullScreen><p className="text-gray-400 text-xl">Cargando...</p></FullScreen>
  if (error || !state) return <FullScreen><p className="text-red-400 text-xl">{error ?? 'Error'}</p></FullScreen>

  const { participants, runs } = state
  const activeRun = runs.find(r => r.status === 'started')

  if (activeRun) {
    const name = participants.find(p => p.id === activeRun.participant_id)?.name
    return (
      <main className="min-h-screen bg-yellow-400 flex flex-col items-center justify-center px-8 gap-4">
        <div className="text-6xl mb-2">⏱</div>
        <div className="text-3xl font-black text-black text-center">{name}</div>
        <div className="text-black/60 font-bold text-xl text-center">Vuelta {activeRun.lap} en curso</div>
        <div className="text-black/40 text-sm text-center mt-2">Espera a que llegue antes de salir otro</div>
        <div className="mt-8 text-sm text-black/30"><a href={`/admin/${joinCode}`}>Panel admin</a></div>
      </main>
    )
  }

  const totalLaps = state.session.total_laps ?? 1

  const participantRuns = (p: Participant) => {
    const pRuns = runs.filter(r => r.participant_id === p.id && r.status === 'finished')
    const hasDnf = runs.some(r => r.participant_id === p.id && r.status === 'dnf')
    const best = pRuns.length > 0 ? Math.min(...pRuns.map(r => r.elapsed_ms ?? Infinity)) : null
    const done = hasDnf || pRuns.length >= totalLaps
    return { laps: pRuns.length, best, done, hasDnf }
  }

  const sorted = [...participants].sort((a, b) => a.order_num - b.order_num)

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col px-4 py-8">
      <div className="mb-6">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500">🏁 Juez Salida</div>
        <div className="text-lg font-black text-white mt-1">{state.session.name}</div>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
          Selecciona el corredor
        </label>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {sorted.map(p => {
            const { laps, best, done, hasDnf } = participantRuns(p)
            return (
              <button
                key={p.id}
                onClick={() => !done && setSelectedId(p.id)}
                disabled={done}
                className={`w-full flex items-center gap-4 rounded-2xl px-5 py-4 transition-all text-left ${
                  done ? 'bg-gray-900 opacity-40 cursor-not-allowed' :
                  selectedId === p.id ? 'bg-green-500 text-white' :
                  'bg-gray-800 text-white active:bg-gray-700'
                }`}
              >
                <span className={`font-black text-xl w-10 text-center ${selectedId === p.id ? 'text-white' : 'text-gray-400'}`}>
                  #{p.order_num}
                </span>
                <div className="flex-1">
                  <div className="font-bold text-lg leading-tight">{p.name}</div>
                  <div className={`text-xs mt-0.5 ${selectedId === p.id ? 'text-white/70' : 'text-gray-500'}`}>
                    {hasDnf ? 'DNF' :
                     laps === 0 ? 'Sin vueltas' :
                     `${laps}/${totalLaps} vueltas${best !== null ? ` · mejor ${formatTime(best)}` : ''}`}
                  </div>
                </div>
                <span className={`text-sm font-black px-2 py-1 rounded-lg ${
                  done ? 'bg-gray-700 text-gray-500' :
                  selectedId === p.id ? 'bg-white/20' :
                  'bg-gray-700 text-gray-400'
                }`}>
                  {done ? '✓' : `V${laps + 1}`}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {feedback && (
        <div className={`rounded-2xl px-4 py-3 text-center font-bold mb-4 ${feedback.type === 'ok' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {feedback.msg}
        </div>
      )}

      <div className="mt-auto">
        <button
          onClick={handleStart}
          disabled={!selectedId || busy}
          className="w-full bg-green-500 active:bg-green-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-black rounded-3xl py-8 text-4xl shadow-lg transition-all"
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

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-8 gap-4">
      {children}
    </main>
  )
}
