'use client'
import { Fish } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="text-white text-center">
        <Fish className="h-16 w-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Sin conexión</h1>
        <p className="text-white/70">Los datos se sincronizarán cuando vuelvas a estar en línea.</p>
      </div>
    </div>
  )
}
