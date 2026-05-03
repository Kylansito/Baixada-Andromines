import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ joinCode: string }> }) {
  const { joinCode } = await params

  const { data: session, error } = await supabaseServer
    .from('sessions')
    .select('*')
    .eq('join_code', joinCode.toUpperCase())
    .single()

  if (error || !session) return NextResponse.json({ error: 'session not found' }, { status: 404 })

  const [{ data: participants }, { data: runs }] = await Promise.all([
    supabaseServer.from('participants').select('*').eq('session_id', session.id).order('order_num'),
    supabaseServer.from('runs').select('*').eq('session_id', session.id),
  ])

  return NextResponse.json({ session, participants: participants ?? [], runs: runs ?? [] })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ joinCode: string }> }) {
  const { joinCode } = await params
  const { status } = await req.json()

  const { error } = await supabaseServer
    .from('sessions')
    .update({ status })
    .eq('join_code', joinCode.toUpperCase())

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
