'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Sin conexion</h1>
        <p className="text-gray-500">
          No se puede conectar al servidor. Verifique su conexion a internet.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-light"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
