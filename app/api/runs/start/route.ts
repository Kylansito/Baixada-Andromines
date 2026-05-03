import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { join_code, participant_id } = await req.json()

  if (!join_code || !participant_id) {
    return NextResponse.json({ error: 'join_code and participant_id required' }, { status: 400 })
  }

  const { data: session } = await supabaseServer
    .from('sessions')
    .select('id, status')
    .eq('join_code', join_code.toUpperCase())
    .single()

  if (!session) return NextResponse.json({ error: 'session not found' }, { status: 404 })
  if (session.status === 'finished') return NextResponse.json({ error: 'session finished' }, { status: 409 })

  // Check no run is currently active for this participant
  const { data: activeForParticipant } = await supabaseServer
    .from('runs')
    .select('id')
    .eq('session_id', session.id)
    .eq('participant_id', participant_id)
    .eq('status', 'started')
    .single()

  if (activeForParticipant) return NextResponse.json({ error: 'este participante ya tiene una vuelta en curso' }, { status: 409 })

  // Check no other run is currently started in the session
  const { data: activeRun } = await supabaseServer
    .from('runs')
    .select('id')
    .eq('session_id', session.id)
    .eq('status', 'started')
    .single()

  if (activeRun) return NextResponse.json({ error: 'another run is already in progress' }, { status: 409 })

  // Calculate lap number for this participant
  const { count } = await supabaseServer
    .from('runs')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', session.id)
    .eq('participant_id', participant_id)

  const lap = (count ?? 0) + 1

  const { data: run, error } = await supabaseServer
    .from('runs')
    .insert({
      session_id: session.id,
      participant_id,
      status: 'started',
      start_ts: new Date().toISOString(),
      lap,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (session.status === 'waiting') {
    await supabaseServer.from('sessions').update({ status: 'racing' }).eq('id', session.id)
  }

  const { data: participant } = await supabaseServer
    .from('participants')
    .select('name')
    .eq('id', participant_id)
    .single()

  await supabaseServer.channel(`session:${join_code.toUpperCase()}`).send({
    type: 'broadcast',
    event: 'run_started',
    payload: { run_id: run.id, participant_id, participant_name: participant?.name ?? '', lap },
  })

  return NextResponse.json({ run_id: run.id, lap }, { status: 201 })
}
