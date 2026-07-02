'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import MobileNav from '@/components/layout/MobileNav'
import { Toaster } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/lotes': 'Lotes',
  '/dashboard/lotes/nuevo': 'Nuevo Lote',
  '/dashboard/calidad': 'Calidad',
  '/dashboard/calidad/registrar': 'Registrar Temperatura',
  '/dashboard/certificaciones': 'Certificaciones',
  '/dashboard/especies': 'Especies',
  '/dashboard/usuarios': 'Usuarios',
  '/dashboard/arquitectura': 'Arquitectura SOA',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const token = useAuthStore((state) => state.token)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = token || localStorage.getItem('token')
    if (!t) {
      router.replace('/login')
      return
    }
    setReady(true)
  }, [token, router])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-slate-500">
        Cargando...
      </div>
    )
  }

  const basePath = '/' + pathname.split('/').slice(1, 3).join('/')
  const title = pageTitles[pathname] || pageTitles[basePath] || 'ExporTrace'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={title} />
        <main className="flex-1 overflow-auto bg-background p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
      <Toaster position="top-right" richColors />
    </div>
  )
}
