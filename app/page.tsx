'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-linear-to-b from-orange-50 to-white px-4 py-12 max-w-md mx-auto flex flex-col">
      <div className="mb-10 text-center">
        <div className="text-6xl mb-3">🛝</div>
        <h1 className="text-4xl font-black text-gray-900">Baixada</h1>
        <p className="text-gray-500 mt-1">Cronometraje para bajada de cacharros</p>
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={() => router.push('/crear')}
          className="w-full bg-orange-500 active:bg-orange-700 text-white font-bold rounded-2xl py-5 text-xl shadow-sm transition-colors"
        >
          ➕ Crear sala
        </button>

        <button
          onClick={() => router.push('/unirse')}
          className="w-full bg-blue-500 active:bg-blue-700 text-white font-bold rounded-2xl py-5 text-xl shadow-sm transition-colors"
        >
          🔗 Unirse a una sala
        </button>

        <button
          onClick={() => router.push('/consultar')}
          className="w-full bg-gray-100 active:bg-gray-200 text-gray-800 font-bold rounded-2xl py-5 text-xl shadow-sm transition-colors"
        >
          📊 Consultar resultados
        </button>
      </div>
    </main>
  )
}
