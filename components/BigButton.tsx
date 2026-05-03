'use client'
interface BigButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  color?: 'green' | 'red' | 'yellow' | 'gray'
  loading?: boolean
}

const colors = {
  green: 'bg-green-500 active:bg-green-700 disabled:bg-green-200 text-white',
  red: 'bg-red-500 active:bg-red-700 disabled:bg-red-200 text-white',
  yellow: 'bg-yellow-400 active:bg-yellow-600 disabled:bg-yellow-100 text-black',
  gray: 'bg-gray-400 active:bg-gray-600 disabled:bg-gray-200 text-white',
}

export default function BigButton({ label, onClick, disabled, color = 'green', loading }: BigButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full rounded-2xl py-10 text-3xl font-bold shadow-lg transition-all select-none touch-none ${colors[color]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? '...' : label}
    </button>
  )
}
