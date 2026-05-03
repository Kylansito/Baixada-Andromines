'use client'
import { use, useState, useCallback } from 'react'
import { useSession, useRealtimeEvents } from '@/hooks/useSession'
import BigButton from '@/components/BigButton'
import type { Participant, RealtimeEvent } from '@/types'

export default function JudgeStartPage({ params }: { params: Promise<{ joinCode: string }> }) {
  const { joinCode } = use(params)
  const { state, loading, error, refetch } = useSession(joinCode)
  const [selectedId, setSelectedId] = useState<string>('')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [feedbackType, setFeedbackType] = useState<'ok' | 'err'>('ok')

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
      setFeedback(data.error)
      setFeedbackType('err')
    } else {
      const name = state?.participants.find(p => p.id === selectedId)?.name ?? ''
      setFeedback(`¡${name} ha salido!`)
      setFeedbackType('ok')
      setSelectedId('')
      refetch()
    }
    setBusy(false)
  }

  if (loading) return <Screen><p className="text-gray-400">Cargando...</p></Screen>
  if (error || !state) return <Screen><p className="text-red-500">{error ?? 'Error'}</p></Screen>

  const { participants, runs } = state
  const doneIds = new Set(runs.filter(r => r.status !== 'pending').map(r => r.participant_id))
  const activeRun = runs.find(r => r.status === 'started')
  const pending: Participant[] = participants.filter(p => !doneIds.has(p.id))

  return (
    <Screen>
      <div className="text-center mb-2">
        <div className="text-4xl">🏁</div>
        <h1 className="text-2xl font-black text-gray-900">Juez Salida</h1>
        <p className="text-sm text-gray-500">{state.session.name}</p>
      </div>

      {activeRun && (
        <div className="bg-yellow-100 border border-yellow-300 rounded-xl px-4 py-3 text-center">
          <p className="text-yellow-800 font-bold">
            ⏱ En pista: {participants.find(p => p.id === activeRun.participant_id)?.name}
          </p>
          <p className="text-xs text-yellow-600">Espera a que llegue antes de salir otro</p>
        </div>
      )}

      {!activeRun && (
        <>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Selecciona participante</label>
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
            >
              <option value="">— Elige —</option>
              {pending.map(p => (
                <option key={p.id} value={p.id}>{p.order_num}. {p.name}{p.vehicle ? ` · ${p.vehicle}` : ''}</option>
              ))}
            </select>
            {pending.length === 0 && (
              <p className="text-center text-gray-400 mt-2 text-sm">Todos han bajado</p>
            )}
          </div>

          <BigButton
            label="SALIDA"
            onClick={handleStart}
            disabled={!selectedId || pending.length === 0}
            loading={busy}
            color="green"
          />
        </>
      )}

      {feedback && (
        <div className={`rounded-xl px-4 py-3 text-center font-semibold ${feedbackType === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
          {feedback}
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
