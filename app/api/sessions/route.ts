import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { generateJoinCode } from '@/lib/joinCode'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, participants, total_laps } = body as { name: string; total_laps: number; participants: Array<{ bib: string; name: string } | string> }

  if (!name || !participants || participants.length === 0) {
    return NextResponse.json({ error: 'name and participants required' }, { status: 400 })
  }

  let join_code = ''
  let attempts = 0
  while (attempts < 10) {
    const code = generateJoinCode()
    const { data } = await supabaseServer.from('sessions').select('id').eq('join_code', code).single()
    if (!data) { join_code = code; break }
    attempts++
  }
  if (!join_code) return NextResponse.json({ error: 'could not generate join code' }, { status: 500 })

  const { data: session, error: sessionError } = await supabaseServer
    .from('sessions')
    .insert({ name, join_code, status: 'waiting', total_laps: total_laps ?? 1 })
    .select()
    .single()

  if (sessionError) return NextResponse.json({ error: sessionError.message }, { status: 500 })

  const rows = participants.map((p, i) => {
    const isObj = typeof p === 'object'
    return {
      session_id: session.id,
      name: isObj ? p.name : (p as string).trim(),
      order_num: isObj && p.bib ? parseInt(p.bib) || (i + 1) : i + 1,
    }
  })

  const { error: participantsError } = await supabaseServer.from('participants').insert(rows)
  if (participantsError) return NextResponse.json({ error: participantsError.message }, { status: 500 })

  return NextResponse.json({ join_code }, { status: 201 })
}
