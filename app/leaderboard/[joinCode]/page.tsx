'use client'
import { use } from 'react'
import { useSession } from '@/hooks/useSession'
import Leaderboard from '@/components/Leaderboard'

export default function LeaderboardPage({ params }: { params: Promise<{ joinCode: string }> }) {
  const { joinCode } = use(params)
  const { state, loading, error } = useSession(joinCode)

  if (loading) return <Screen><p className="text-gray-400 text-center py-10">Cargando...</p></Screen>
  if (error || !state) return <Screen><p className="text-red-500 text-center py-10">{error ?? 'Error'}</p></Screen>

  const { session, participants, runs } = state

  return (
    <Screen>
      <div className="text-center mb-4">
        <div className="text-3xl">📊</div>
        <h1 className="text-2xl font-black text-gray-900">{session.name}</h1>
        <p className="text-sm text-gray-500">Clasificación en directo</p>
      </div>
      <Leaderboard participants={participants} runs={runs} />
    </Screen>
  )
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 max-w-md mx-auto">
      {children}
    </main>
  )
}
