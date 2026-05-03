'use client'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/hooks/useSession'
import JoinCodeDisplay from '@/components/JoinCodeDisplay'
import Leaderboard from '@/components/Leaderboard'
import type { Run } from '@/types'

export default function AdminPage({ params }: { params: Promise<{ joinCode: string }> }) {
  const { joinCode } = use(params)
  const router = useRouter()
  const { state, loading, error } = useSession(joinCode)

  async function handleFinish() {
    if (!confirm('¿Finalizar la carrera?')) return
    await fetch(`/api/sessions/${joinCode}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'finished' }),
    })
    router.push(`/results/${joinCode}`)
  }

  async function handleDNF(run: Run) {
    if (!confirm('¿Marcar como DNF?')) return
    await fetch('/api/runs/finish', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ join_code: joinCode, run_id: run.id }),
    })
  }

  if (loading) return <Loading />
  if (error || !state) return <Error msg={error ?? 'Error'} />

  const { session, participants, runs } = state
  const activeRun = runs.find(r => r.status === 'started')

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 max-w-md mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">{session.name}</h1>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            session.status === 'racing' ? 'bg-green-100 text-green-700' :
            session.status === 'finished' ? 'bg-gray-200 text-gray-600' :
            'bg-yellow-100 text-yellow-700'
          }`}>{session.status}</span>
        </div>
      </div>

      <JoinCodeDisplay joinCode={joinCode} baseUrl={baseUrl} />

      <div className="grid grid-cols-2 gap-3">
        <a
          href={`/judge/${joinCode}/start`}
          className="bg-green-500 text-white font-bold rounded-xl py-4 text-center text-lg"
        >
          🏁 Juez Salida
        </a>
        <a
          href={`/judge/${joinCode}/finish`}
          className="bg-red-500 text-white font-bold rounded-xl py-4 text-center text-lg"
        >
          🏆 Juez Llegada
        </a>
      </div>

      <a
        href={`/leaderboard/${joinCode}`}
        className="block bg-blue-50 border border-blue-200 text-blue-700 font-semibold rounded-xl py-3 text-center"
      >
        📊 Ver clasificación en directo
      </a>

      {activeRun && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-yellow-600 font-semibold uppercase">En pista</div>
            <div className="font-bold">
              {participants.find(p => p.id === activeRun.participant_id)?.name}
            </div>
          </div>
          <button
            onClick={() => handleDNF(activeRun)}
            className="text-sm bg-yellow-200 text-yellow-800 rounded-lg px-3 py-1 font-semibold"
          >
            DNF
          </button>
        </div>
      )}

      <Leaderboard participants={participants} runs={runs} totalLaps={session.total_laps} />

      {session.status !== 'finished' && (
        <button
          onClick={handleFinish}
          className="w-full border border-gray-300 text-gray-600 font-semibold rounded-xl py-3 mt-4"
        >
          Finalizar carrera
        </button>
      )}
    </main>
  )
}

function Loading() {
  return <div className="min-h-screen flex items-center justify-center text-gray-400">Cargando...</div>
}
function Error({ msg }: { msg: string }) {
  return <div className="min-h-screen flex items-center justify-center text-red-500">{msg}</div>
}
