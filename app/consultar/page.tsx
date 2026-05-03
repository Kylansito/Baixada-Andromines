'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ConsultarPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConsult() {
    const clean = code.trim().toUpperCase()
    if (clean.length !== 6) { setError('El código tiene 6 caracteres.'); return }

    setLoading(true)
    setError('')
    const res = await fetch(`/api/sessions/${clean}`)
    if (!res.ok) { setError('Sala no encontrada.'); setLoading(false); return }
    const data = await res.json()
    if (data.session.status === 'finished') {
      router.push(`/results/${clean}`)
    } else {
      router.push(`/leaderboard/${clean}`)
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 max-w-md mx-auto flex flex-col">
      <button onClick={() => router.back()} className="text-sm text-gray-400 mb-6">← Volver</button>

      <div className="mb-8">
        <div className="text-3xl mb-1">📊</div>
        <h1 className="text-2xl font-black text-gray-900">Consultar sala</h1>
        <p className="text-gray-500 text-sm mt-1">Ver clasificación en directo o resultados finales</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Código de sala</label>
          <input
            className="w-full border border-gray-300 rounded-xl px-4 py-4 text-3xl font-black text-center tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="XXXXXX"
            value={code}
            maxLength={6}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleConsult()}
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          onClick={handleConsult}
          disabled={loading || code.trim().length !== 6}
          className="w-full bg-gray-800 active:bg-gray-900 disabled:opacity-40 text-white font-bold rounded-2xl py-4 text-xl transition-colors"
        >
          {loading ? 'Buscando...' : 'Ver clasificación →'}
        </button>
      </div>
    </main>
  )
}
