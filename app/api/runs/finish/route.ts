import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

async function checkAndFinishSession(sessionId: string, joinCode: string) {
  const { data: session } = await supabaseServer
    .from('sessions')
    .select('total_laps, status')
    .eq('id', sessionId)
    .single()

  if (!session || session.status === 'finished') return

  const { data: participants } = await supabaseServer
    .from('participants')
    .select('id')
    .eq('session_id', sessionId)

  if (!participants || participants.length === 0) return

  const { data: runs } = await supabaseServer
    .from('runs')
    .select('participant_id, status, lap')
    .eq('session_id', sessionId)

  if (!runs) return

  const allDone = participants.every(p => {
    const pRuns = runs.filter(r => r.participant_id === p.id)
    const hasDnf = pRuns.some(r => r.status === 'dnf')
    const finishedLaps = pRuns.filter(r => r.status === 'finished').length
    return hasDnf || finishedLaps >= session.total_laps
  })

  if (allDone) {
    await supabaseServer.from('sessions').update({ status: 'finished' }).eq('id', sessionId)
    await supabaseServer.channel(`session:${joinCode.toUpperCase()}`).send({
      type: 'broadcast',
      event: 'session_finished',
      payload: {},
    })
  }
}

export async function POST(req: NextRequest) {
  const { join_code, run_id } = await req.json()

  if (!join_code || !run_id) {
    return NextResponse.json({ error: 'join_code and run_id required' }, { status: 400 })
  }

  const finish_ts = new Date().toISOString()

  const { data: run, error } = await supabaseServer
    .from('runs')
    .update({ finish_ts, status: 'finished' })
    .eq('id', run_id)
    .eq('status', 'started')
    .select('*, participants(name)')
    .single()

  if (error || !run) return NextResponse.json({ error: 'run not found or already finished' }, { status: 409 })

  await supabaseServer.channel(`session:${join_code.toUpperCase()}`).send({
    type: 'broadcast',
    event: 'run_finished',
    payload: {
      run_id: run.id,
      participant_id: run.participant_id,
      elapsed_ms: run.elapsed_ms,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      participant_name: (run as any).participants?.name ?? '',
    },
  })

  await checkAndFinishSession(run.session_id, join_code)

  return NextResponse.json({ elapsed_ms: run.elapsed_ms })
}

export async function DELETE(req: NextRequest) {
  const { join_code, run_id } = await req.json()

  const { data: run, error } = await supabaseServer
    .from('runs')
    .update({ status: 'dnf' })
    .eq('id', run_id)
    .eq('status', 'started')
    .select('*, participants(name)')
    .single()

  if (error || !run) return NextResponse.json({ error: 'run not found' }, { status: 409 })

  await supabaseServer.channel(`session:${join_code.toUpperCase()}`).send({
    type: 'broadcast',
    event: 'run_dnf',
    payload: {
      run_id: run.id,
      participant_id: run.participant_id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      participant_name: (run as any).participants?.name ?? '',
    },
  })

  await checkAndFinishSession(run.session_id, join_code)

  return NextResponse.json({ ok: true })
}
