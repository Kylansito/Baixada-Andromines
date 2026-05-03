import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

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

  return NextResponse.json({ ok: true })
}
