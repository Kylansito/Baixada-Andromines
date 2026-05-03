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
    router.push(data.session.status === 'finished' ? `/results/${clean}` : `/leaderboard/${clean}`)
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col px-4 py-8">
      <button onClick={() => router.back()} className="text-sm text-gray-600 mb-8">← Volver</button>

      <div className="mb-8">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Públic</div>
        <h1 className="text-4xl font-black text-white">Ver resultados</h1>
        <p className="text-gray-500 text-sm mt-2">Clasificación en directo o resultados finales</p>
      </div>

      <div className="space-y-6">
        <input
          className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-5 text-4xl font-black text-center tracking-widest uppercase text-white focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-600"
          placeholder="XXXXXX"
          value={code}
          maxLength={6}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleConsult()}
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <button
          onClick={handleConsult}
          disabled={loading || code.trim().length !== 6}
          className="w-full bg-gray-800 active:bg-gray-700 disabled:opacity-40 text-white font-black rounded-3xl py-6 text-2xl transition-colors"
        >
          {loading ? 'Buscando...' : 'Ver clasificación →'}
        </button>
      </div>
    </main>
  )
}
