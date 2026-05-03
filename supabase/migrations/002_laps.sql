-- Eliminar unique index (un participante ahora puede tener múltiples vueltas)
DROP INDEX IF EXISTS runs_session_id_participant_id_idx;

-- Añadir columna de vuelta
ALTER TABLE runs ADD COLUMN IF NOT EXISTS lap int NOT NULL DEFAULT 1;
