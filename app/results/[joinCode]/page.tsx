import { supabaseServer } from '@/lib/supabase/server'
import { formatTime } from '@/lib/format'
import type { Participant, Run } from '@/types'

export default async function ResultsPage({ params }: { params: Promise<{ joinCode: string }> }) {
  const { joinCode } = await params

  const { data: session } = await supabaseServer
    .from('sessions')
    .select('*')
    .eq('join_code', joinCode.toUpperCase())
    .single()

  if (!session) return <div className="p-8 text-center text-red-500">Carrera no encontrada</div>

  const [{ data: participants }, { data: runs }] = await Promise.all([
    supabaseServer.from('participants').select('*').eq('session_id', session.id).order('order_num'),
    supabaseServer.from('runs').select('*').eq('session_id', session.id),
  ])

  const allParticipants: Participant[] = participants ?? []
  const allRuns: Run[] = runs ?? []

  const finished = allRuns
    .filter(r => r.status === 'finished' && r.elapsed_ms !== null)
    .sort((a, b) => (a.elapsed_ms ?? 0) - (b.elapsed_ms ?? 0))

  const pMap = Object.fromEntries(allParticipants.map(p => [p.id, p]))
  const doneIds = new Set(allRuns.filter(r => r.status !== 'pending').map(r => r.participant_id))
  const dnf = allParticipants.filter(p => {
    const run = allRuns.find(r => r.participant_id === p.id)
    return run?.status === 'dnf'
  })
  const noRun = allParticipants.filter(p => !doneIds.has(p.id))

  return (
    <main className="min-h-screen bg-white px-4 py-8 max-w-md mx-auto print:max-w-full print:px-8">
      <div className="text-center mb-6">
        <div className="text-3xl">🏆</div>
        <h1 className="text-2xl font-black">{session.name}</h1>
        <p className="text-sm text-gray-500">Resultados finales</p>
      </div>

      <table className="w-full text-left border-collapse mb-6">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-2 w-8 text-gray-400">#</th>
            <th className="py-2">Participante</th>
            <th className="py-2 text-right font-mono">Tiempo</th>
          </tr>
        </thead>
        <tbody>
          {finished.map((run, i) => {
            const p = pMap[run.participant_id]
            return (
              <tr key={run.id} className="border-b border-gray-100">
                <td className="py-3 text-gray-400 font-semibold">{i + 1}</td>
                <td className="py-3">
                  <div className="font-semibold">{p?.name}</div>
                  {p?.vehicle && <div className="text-xs text-gray-400">{p.vehicle}</div>}
                </td>
                <td className="py-3 text-right font-mono font-bold">{formatTime(run.elapsed_ms!)}</td>
              </tr>
            )
          })}
          {dnf.map(p => (
            <tr key={p.id} className="border-b border-gray-100 opacity-50">
              <td className="py-3">—</td>
              <td className="py-3">{p.name}</td>
              <td className="py-3 text-right text-xs text-gray-400">DNF</td>
            </tr>
          ))}
          {noRun.map(p => (
            <tr key={p.id} className="border-b border-gray-100 opacity-40">
              <td className="py-3">—</td>
              <td className="py-3">{p.name}</td>
              <td className="py-3 text-right text-xs text-gray-400">No bajó</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        onClick={() => window.print()}
        className="w-full border border-gray-300 rounded-xl py-3 text-gray-600 font-semibold print:hidden"
      >
        Imprimir resultados
      </button>
    </main>
  )
}
