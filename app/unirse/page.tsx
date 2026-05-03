'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UnirsePage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleJoin(role: 'start' | 'finish') {
    const clean = code.trim().toUpperCase()
    if (clean.length !== 6) { setError('El código tiene 6 caracteres.'); return }
    setLoading(true)
    setError('')
    const res = await fetch(`/api/sessions/${clean}`)
    if (!res.ok) { setError('Sala no encontrada.'); setLoading(false); return }
    router.push(`/judge/${clean}/${role}`)
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col px-4 py-8">
      <button onClick={() => router.back()} className="text-sm text-gray-600 mb-8">← Volver</button>

      <div className="mb-8">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Jutge</div>
        <h1 className="text-4xl font-black text-white">Unirse a sala</h1>
        <p className="text-gray-500 text-sm mt-2">Introduce el código del organizador</p>
      </div>

      <div className="space-y-6">
        <input
          className="w-full bg-gray-800 border border-gray-700 rounded-2xl px-4 py-5 text-4xl font-black text-center tracking-widest uppercase text-white focus:outline-none focus:ring-2 focus:ring-gray-500 placeholder-gray-600"
          placeholder="XXXXXX"
          value={code}
          maxLength={6}
          onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
        />

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 text-center">Escull el teu rol</p>

          <button
            onClick={() => handleJoin('start')}
            disabled={loading || code.trim().length !== 6}
            className="w-full bg-green-500 active:bg-green-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-black rounded-3xl py-6 text-2xl transition-colors text-left px-6"
          >
            <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-0.5">Dalt de la baixada</div>
            🏁 Juez Salida
          </button>

          <button
            onClick={() => handleJoin('finish')}
            disabled={loading || code.trim().length !== 6}
            className="w-full bg-red-500 active:bg-red-700 disabled:bg-gray-800 disabled:text-gray-600 text-white font-black rounded-3xl py-6 text-2xl transition-colors text-left px-6"
          >
            <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-0.5">Baix de la baixada</div>
            🏆 Juez Llegada
          </button>
        </div>
      </div>
    </main>
  )
}
