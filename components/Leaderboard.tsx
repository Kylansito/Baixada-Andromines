'use client'
import { formatTime } from '@/lib/format'
import type { Participant, Run } from '@/types'

interface Props {
  participants: Participant[]
  runs: Run[]
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ participants, runs }: Props) {
  const finished = runs
    .filter(r => r.status === 'finished' && r.elapsed_ms !== null)
    .sort((a, b) => (a.elapsed_ms ?? 0) - (b.elapsed_ms ?? 0))

  const started = runs.filter(r => r.status === 'started')
  const doneIds = new Set(runs.filter(r => r.status !== 'pending').map(r => r.participant_id))
  const pending = participants.filter(p => !doneIds.has(p.id)).sort((a, b) => a.order_num - b.order_num)

  const pMap = Object.fromEntries(participants.map(p => [p.id, p]))

  return (
    <div className="space-y-6">
      {/* Clasificación */}
      {finished.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">🏁 Clasificación</div>
          <div className="space-y-2">
            {finished.map((run, i) => {
              const p = pMap[run.participant_id]
              const isTop = i < 3
              return (
                <div
                  key={run.id}
                  className={`flex items-center rounded-2xl px-4 py-4 gap-3 ${
                    i === 0 ? 'bg-yellow-400 text-black' :
                    i === 1 ? 'bg-gray-300 text-black' :
                    i === 2 ? 'bg-orange-300 text-black' :
                    'bg-gray-800 text-white'
                  }`}
                >
                  <span className="text-2xl w-8 text-center">{MEDALS[i] ?? <span className="text-sm font-bold text-gray-400">{i + 1}</span>}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-black text-lg leading-tight truncate ${isTop ? '' : 'text-white'}`}>
                      {p?.name ?? '—'}
                    </div>
                    <div className={`text-xs ${isTop ? 'opacity-60' : 'text-gray-400'}`}>#{p?.order_num}</div>
                  </div>
                  <span className={`font-mono font-black text-xl tabular-nums ${isTop ? '' : 'text-green-400'}`}>
                    {formatTime(run.elapsed_ms!)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* En pista (sólo cuando no hay banner arriba — para uso en admin) */}
      {started.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">⏱ En pista</div>
          {started.map(run => {
            const p = pMap[run.participant_id]
            return (
              <div key={run.id} className="bg-yellow-400 text-black rounded-2xl px-4 py-3 font-bold text-lg">
                {p?.name ?? '—'} <span className="text-sm font-normal opacity-60">#{p?.order_num}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Pendientes */}
      {pending.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">⏳ Pendientes ({pending.length})</div>
          <div className="space-y-1">
            {pending.map((p) => (
              <div key={p.id} className="flex items-center bg-gray-800 rounded-xl px-4 py-3 gap-3">
                <span className="text-gray-500 font-bold w-8 text-center">#{p.order_num}</span>
                <span className="text-white font-semibold">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {finished.length === 0 && started.length === 0 && pending.length === 0 && (
        <p className="text-center text-gray-500 py-12">Sin participantes</p>
      )}
    </div>
  )
}
