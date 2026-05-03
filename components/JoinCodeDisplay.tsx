'use client'
import { QRCodeSVG } from 'qrcode.react'

interface Props {
  joinCode: string
  baseUrl?: string
}

export default function JoinCodeDisplay({ joinCode, baseUrl }: Props) {
  const url = baseUrl ? `${baseUrl}/leaderboard/${joinCode}` : ''
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="text-sm text-gray-500 uppercase tracking-widest">Código de sala</div>
      <div className="text-5xl font-black tracking-widest text-gray-900">{joinCode}</div>
      {url && <QRCodeSVG value={url} size={140} />}
      <div className="text-xs text-gray-400 break-all text-center">{url}</div>
    </div>
  )
}
