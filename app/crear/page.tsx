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
  const [totalLaps, setTotalLaps] = useState(1)
  const [rows, setRows] = useState<ParticipantRow[]>([{ bib: '1', name: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addRow() {
    setRows(r => [...r, { bib: String(r.length + 1), name: '' }])
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
        total_laps: totalLaps,
        participants: valid.map(r => ({ bib: r.bib.trim(), name: r.name.trim() })),
      }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.push(`/admin/${data.join_code}`)
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col px-4 py-8">
      <button onClick={() => router.back()} className="text-sm text-gray-600 mb-8">← Volver</button>

      <div className="mb-8">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Organitzador</div>
        <h1 className="text-4xl font-black text-white">Nova carrera</h1>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Nom de la carrera</label>
          <input
            className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-4 text-xl text-white font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-600"
            placeholder="Baixada 2026 - Carrer Major"
            value={sessionName}
            onChange={e => setSessionName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Número de vueltas</label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTotalLaps(l => Math.max(1, l - 1))}
              className="w-14 h-14 bg-gray-800 text-white text-2xl font-black rounded-2xl active:bg-gray-700 flex items-center justify-center"
            >−</button>
            <span className="flex-1 text-center text-5xl font-black text-white tabular-nums">{totalLaps}</span>
            <button
              onClick={() => setTotalLaps(l => Math.min(20, l + 1))}
              className="w-14 h-14 bg-gray-800 text-white text-2xl font-black rounded-2xl active:bg-gray-700 flex items-center justify-center"
            >+</button>
          </div>
          <p className="text-center text-xs text-gray-600 mt-2">
            {totalLaps === 1 ? 'Una sola bajada por corredor' : `${totalLaps} bajadas por corredor`}
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Participants</label>
            <span className="text-xs text-gray-600">{rows.filter(r => r.name.trim()).length} corredors</span>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-[56px_1fr_36px] gap-2 px-1 mb-1">
              <span className="text-xs text-gray-600 font-bold text-center">Nº</span>
              <span className="text-xs text-gray-600 font-bold">Nom</span>
              <span />
            </div>

            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-[56px_1fr_36px] gap-2 items-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={row.bib}
                  onChange={e => updateRow(i, 'bib', e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-2 py-3 text-center font-black text-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="1"
                />
                <input
                  type="text"
                  value={row.name}
                  onChange={e => updateRow(i, 'name', e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-base text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-600"
                  placeholder="Nom del corredor"
                  onKeyDown={e => e.key === 'Enter' && addRow()}
                />
                <button
                  onClick={() => removeRow(i)}
                  disabled={rows.length === 1}
                  className="text-gray-600 active:text-red-400 disabled:opacity-20 text-2xl font-bold w-9 h-9 flex items-center justify-center rounded-xl"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addRow}
            className="mt-3 w-full border-2 border-dashed border-gray-700 text-gray-600 font-semibold rounded-2xl py-3 text-sm active:border-orange-500 active:text-orange-500 transition-colors"
          >
            + Afegir corredor
          </button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-orange-500 active:bg-orange-700 disabled:opacity-50 text-white font-black rounded-3xl py-6 text-2xl transition-colors mt-2"
        >
          {loading ? 'Creant...' : 'Crear carrera →'}
        </button>
      </div>
    </main>
  )
}
