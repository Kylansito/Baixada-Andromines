export type SessionStatus = 'waiting' | 'racing' | 'finished'
export type RunStatus = 'pending' | 'started' | 'finished' | 'dnf'

export interface Session {
  id: string
  name: string
  join_code: string
  status: SessionStatus
  total_laps: number
  created_at: string
}

export interface Participant {
  id: string
  session_id: string
  name: string
  vehicle: string | null
  order_num: number
  created_at: string
}

export interface Run {
  id: string
  session_id: string
  participant_id: string
  start_ts: string | null
  finish_ts: string | null
  elapsed_ms: number | null
  status: RunStatus
  lap: number
  created_at: string
}

export interface SessionState {
  session: Session
  participants: Participant[]
  runs: Run[]
}

export type RealtimeEvent =
  | { event: 'run_started'; payload: { run_id: string; participant_id: string; participant_name: string } }
  | { event: 'run_finished'; payload: { run_id: string; participant_id: string; elapsed_ms: number; participant_name: string } }
  | { event: 'run_dnf'; payload: { run_id: string; participant_id: string; participant_name: string } }
  | { event: 'session_finished'; payload: Record<string, never> }
