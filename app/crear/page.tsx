'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ParticipantRow {
  bib: string
  name: string
}

export default function CrearPage() {
  const router = useRouter()
  const [sessionName, setSessionName] = useState('')
  const [rows, setRows] = useState<ParticipantRow[]>([{ bib: '1', name: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addRow() {
    const nextBib = String(rows.length + 1)
    setRows(r => [...r, { bib: nextBib, name: '' }])
  }

  function removeRow(i: number) {
    setRows(r => r.filter((_, idx) => idx !== i))
  }

  function updateRow(i: number, field: 'bib' | 'name', value: string) {
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  }

  async function handleCreate() {
    const valid = rows.filter(r => r.name.trim())
    if (!sessionName.trim()) { setError('Escribe el nombre de la carrera.'); return }
    if (valid.length === 0) { setError('Añade al menos un participante.'); return }

    setLoading(true)
    setError('')
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: sessionName.trim(),
        participants: valid.map(r => ({ bib: r.bib.trim(), name: r.name.trim() })),
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.push(`/admin/${data.join_code}`)
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 max-w-md mx-auto">
      <button onClick={() => router.back()} className="text-sm text-gray-400 mb-6 flex items-center gap-1">
        ← Volver
      </button>

      <div className="mb-6">
        <div className="text-3xl mb-1">🛝</div>
        <h1 className="text-2xl font-black text-gray-900">Nueva carrera</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de la carrera</label>
          <input
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Ej: Baixada 2026 - Calle Mayor"
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Participantes</label>
            <span className="text-xs text-gray-400">{rows.filter(r => r.name.trim()).length} corredores</span>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[60px_1fr_36px] gap-2 px-1 mb-1">
              <span className="text-xs text-gray-400 font-semibold">Nº</span>
              <span className="text-xs text-gray-400 font-semibold">Nombre</span>
              <span />
            </div>

            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-[60px_1fr_36px] gap-2 items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={row.bib}
                  onChange={e => updateRow(i, 'bib', e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-3 text-center font-bold text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="1"
                />
                <input
                  type="text"
                  value={row.name}
                  onChange={e => updateRow(i, 'name', e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Nombre del corredor"
                  onKeyDown={e => e.key === 'Enter' && addRow()}
                />
                <button
                  onClick={() => removeRow(i)}
                  disabled={rows.length === 1}
                  className="text-gray-300 hover:text-red-400 disabled:opacity-20 text-xl font-bold w-9 h-9 flex items-center justify-center rounded-xl"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addRow}
            className="mt-3 w-full border-2 border-dashed border-gray-200 text-gray-400 font-semibold rounded-xl py-3 text-sm active:border-orange-300 active:text-orange-400 transition-colors"
          >
            + Añadir corredor
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-orange-500 active:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-2xl py-4 text-xl transition-colors"
        >
          {loading ? 'Creando...' : 'Crear carrera →'}
        </button>
      </div>
    </main>
  )
}
