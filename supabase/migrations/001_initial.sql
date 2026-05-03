CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  join_code text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name text NOT NULL,
  vehicle text,
  order_num int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  start_ts timestamptz,
  finish_ts timestamptz,
  elapsed_ms bigint GENERATED ALWAYS AS (
    CASE
      WHEN start_ts IS NOT NULL AND finish_ts IS NOT NULL
      THEN (EXTRACT(EPOCH FROM (finish_ts - start_ts)) * 1000)::bigint
      ELSE NULL
    END
  ) STORED,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON runs(session_id, status);
CREATE INDEX ON runs(participant_id);
CREATE UNIQUE INDEX ON runs(session_id, participant_id) WHERE status != 'dnf';
