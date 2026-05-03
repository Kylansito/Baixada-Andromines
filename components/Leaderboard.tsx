'use client'
import { formatTime } from '@/lib/format'
import type { Participant, Run } from '@/types'

interface Props {
  participants: Participant[]
  runs: Run[]
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ participants, runs }: Props) {
  const pMap = Object.fromEntries(participants.map(p => [p.id, p]))

  // Best time per participant (ignoring DNF)
  const bestByParticipant = participants.map(p => {
    const finished = runs.filter(r => r.participant_id === p.id && r.status === 'finished' && r.elapsed_ms !== null)
    const lapsCompleted = finished.length
    const best = finished.length > 0 ? Math.min(...finished.map(r => r.elapsed_ms!)) : null
    return { participant: p, best, lapsCompleted }
  })

  const classified = bestByParticipant
    .filter(x => x.best !== null)
    .sort((a, b) => a.best! - b.best!)

  const started = runs.filter(r => r.status === 'started')

  const noRunYet = participants.filter(p => {
    const pRuns = runs.filter(r => r.participant_id === p.id)
    return pRuns.length === 0
  }).sort((a, b) => a.order_num - b.order_num)

  return (
    <div className="space-y-6">
      {/* Clasificación */}
      {classified.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">🏁 Classificació</div>
          <div className="space-y-2">
            {classified.map(({ participant: p, best, lapsCompleted }, i) => (
              <div
                key={p.id}
                className={`flex items-center rounded-2xl px-4 py-4 gap-3 ${
                  i === 0 ? 'bg-yellow-400 text-black' :
                  i === 1 ? 'bg-gray-300 text-black' :
                  i === 2 ? 'bg-orange-300 text-black' :
                  'bg-gray-800 text-white'
                }`}
              >
                <span className="text-2xl w-8 text-center">{MEDALS[i] ?? <span className="text-sm font-bold text-gray-400">{i + 1}</span>}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-lg leading-tight truncate">{p.name}</div>
                  <div className={`text-xs ${i < 3 ? 'opacity-60' : 'text-gray-400'}`}>
                    #{p.order_num} · {lapsCompleted} volta{lapsCompleted !== 1 ? 'es' : ''}
                  </div>
                </div>
                <span className={`font-mono font-black text-xl tabular-nums ${i < 3 ? '' : 'text-green-400'}`}>
                  {formatTime(best!)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* En pista */}
      {started.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">⏱ En pista</div>
          {started.map(run => {
            const p = pMap[run.participant_id]
            return (
              <div key={run.id} className="bg-yellow-400 text-black rounded-2xl px-4 py-3 font-bold text-lg">
                {p?.name ?? '—'} <span className="text-sm font-normal opacity-60">#{p?.order_num} · Vuelta {run.lap}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Sin vuelta todavía */}
      {noRunYet.length > 0 && (
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">⏳ Sense voltes ({noRunYet.length})</div>
          <div className="space-y-1">
            {noRunYet.map(p => (
              <div key={p.id} className="flex items-center bg-gray-800 rounded-xl px-4 py-3 gap-3">
                <span className="text-gray-500 font-bold w-8 text-center">#{p.order_num}</span>
                <span className="text-white font-semibold">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {classified.length === 0 && started.length === 0 && noRunYet.length === 0 && (
        <p className="text-center text-gray-500 py-12">Sense participants</p>
      )}
    </div>
  )
}
