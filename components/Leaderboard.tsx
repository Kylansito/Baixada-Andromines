'use client'
import { formatTime } from '@/lib/format'
import type { Participant, Run } from '@/types'

interface Props {
  participants: Participant[]
  runs: Run[]
}

export default function Leaderboard({ participants, runs }: Props) {
  const finished = runs
    .filter(r => r.status === 'finished' && r.elapsed_ms !== null)
    .sort((a, b) => (a.elapsed_ms ?? 0) - (b.elapsed_ms ?? 0))

  const started = runs.filter(r => r.status === 'started')
  const doneIds = new Set(runs.filter(r => r.status !== 'pending').map(r => r.participant_id))
  const pending = participants.filter(p => !doneIds.has(p.id))

  const participantMap = Object.fromEntries(participants.map(p => [p.id, p]))

  return (
    <div className="space-y-6">
      {finished.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-2 text-gray-700">🏁 Clasificación</h2>
          <div className="rounded-xl overflow-hidden border border-gray-200">
            {finished.map((run, i) => {
              const p = participantMap[run.participant_id]
              return (
                <div key={run.id} className={`flex items-center px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <span className="w-8 font-bold text-gray-400">{i + 1}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{p?.name ?? '—'}</div>
                    {p?.vehicle && <div className="text-sm text-gray-500">{p.vehicle}</div>}
                  </div>
                  <span className="font-mono font-bold text-lg">{formatTime(run.elapsed_ms!)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {started.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-2 text-yellow-600">⏱ En pista</h2>
          {started.map(run => {
            const p = participantMap[run.participant_id]
            return (
              <div key={run.id} className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                <span className="font-semibold">{p?.name ?? '—'}</span>
              </div>
            )
          })}
        </div>
      )}

      {pending.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-2 text-gray-500">⏳ Pendientes</h2>
          <div className="rounded-xl overflow-hidden border border-gray-100">
            {pending.map((p, i) => (
              <div key={p.id} className={`flex items-center px-4 py-3 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                <span className="w-8 text-gray-400">{p.order_num}</span>
                <div>
                  <div className="font-medium">{p.name}</div>
                  {p.vehicle && <div className="text-sm text-gray-400">{p.vehicle}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {finished.length === 0 && started.length === 0 && pending.length === 0 && (
        <p className="text-center text-gray-400 py-8">Sin participantes</p>
      )}
    </div>
  )
}
