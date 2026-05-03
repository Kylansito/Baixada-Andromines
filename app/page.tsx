'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [participantsText, setParticipantsText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    const participants = participantsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)

    if (!name.trim() || participants.length === 0) {
      setError('Necesitas un nombre de carrera y al menos un participante.')
      return
    }

    setLoading(true)
    setError('')
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), participants }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    router.push(`/admin/${data.join_code}`)
  }

  return (
    <main className="min-h-screen bg-linear-to-b from-orange-50 to-white px-4 py-10 max-w-md mx-auto">
      <div className="mb-8 text-center">
        <div className="text-5xl mb-2">🛝</div>
        <h1 className="text-3xl font-black text-gray-900">Baixada</h1>
        <p className="text-gray-500 mt-1">Cronometraje para bajada de cacharros</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de la carrera</label>
          <input
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="Ej: Baixada 2026 - Calle Mayor"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Participantes <span className="text-gray-400 font-normal">(uno por línea)</span>
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 h-48 resize-none"
            placeholder={"Pere - Kart de fusta\nMaria - Turbo 3000\nJoan"}
            value={participantsText}
            onChange={e => setParticipantsText(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">
            {participantsText.split('\n').filter(s => s.trim()).length} participantes
          </p>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-50 text-white font-bold rounded-2xl py-4 text-xl transition-colors"
        >
          {loading ? 'Creando...' : 'Crear carrera →'}
        </button>
      </div>
    </main>
  )
}
