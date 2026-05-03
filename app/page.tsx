'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col px-4 py-12">
      <div className="mb-12 mt-4">
        <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Cronometraje</div>
        <h1 className="text-5xl font-black text-white leading-tight">Baixada</h1>
        <p className="text-gray-500 mt-2">Bajada de cacharros</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => router.push('/crear')}
          className="w-full bg-orange-500 active:bg-orange-700 text-white font-black rounded-3xl py-6 text-2xl shadow-lg transition-colors text-left px-6"
        >
          <div className="text-sm font-bold uppercase tracking-widest opacity-70 mb-0.5">Organitzador</div>
          Crear sala
        </button>

        <button
          onClick={() => router.push('/unirse')}
          className="w-full bg-gray-800 active:bg-gray-700 text-white font-black rounded-3xl py-6 text-2xl shadow-lg transition-colors text-left px-6"
        >
          <div className="text-sm font-bold uppercase tracking-widest opacity-50 mb-0.5">Jutge</div>
          Unirse a sala
        </button>

        <button
          onClick={() => router.push('/consultar')}
          className="w-full bg-gray-800 active:bg-gray-700 text-white font-black rounded-3xl py-6 text-2xl shadow-lg transition-colors text-left px-6"
        >
          <div className="text-sm font-bold uppercase tracking-widest opacity-50 mb-0.5">Públic</div>
          Ver resultados
        </button>
      </div>
    </main>
  )
}
