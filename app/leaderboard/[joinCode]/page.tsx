'use client'
import { use } from 'react'
import { useSession } from '@/hooks/useSession'
import Leaderboard from '@/components/Leaderboard'

export default function LeaderboardPage({ params }: { params: Promise<{ joinCode: string }> }) {
  const { joinCode } = use(params)
  const { state, loading, error } = useSession(joinCode)

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 text-lg">Cargando...</p>
    </main>
  )
  if (error || !state) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-red-500">{error ?? 'Error'}</p>
    </main>
  )

  const { session, participants, runs } = state
  const activeRun = runs.find(r => r.status === 'started')
  const activeName = activeRun ? participants.find(p => p.id === activeRun.participant_id)?.name : null

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 px-4 pt-8 pb-6">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Classificació en directe</div>
        <h1 className="text-2xl font-black leading-tight">{session.name}</h1>
        <div className="mt-2 flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${session.status === 'racing' ? 'bg-green-400 animate-pulse' : session.status === 'finished' ? 'bg-gray-500' : 'bg-yellow-400'}`} />
          <span className="text-sm text-gray-400">
            {session.status === 'racing' ? 'En curso' : session.status === 'finished' ? 'Finalizada' : 'Esperando inicio'}
          </span>
        </div>
      </div>

      {/* En pista */}
      {activeName && (
        <div className="mx-4 mt-4 bg-yellow-400 text-black rounded-2xl px-5 py-4 flex items-center gap-3">
          <span className="text-2xl">⏱</span>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide opacity-60">En pista ahora</div>
            <div className="text-xl font-black">{activeName}</div>
          </div>
        </div>
      )}

      <div className="px-4 pb-8 mt-4">
        <Leaderboard participants={participants} runs={runs} totalLaps={session.total_laps} />
      </div>
    </main>
  )
}
