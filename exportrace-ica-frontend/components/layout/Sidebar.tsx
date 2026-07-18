'use client'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  Fish,
  LayoutDashboard,
  Thermometer,
  FileCheck,
  BookOpen,
  Users,
  Layers3,
  Activity,
  Anchor,
  Clipboard,
  Layers,
  Snowflake,
  Truck,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'QA', 'LOGISTICA', 'TI'] },
  { href: '/dashboard/arquitectura', label: 'Arquitectura SOA', icon: Layers3, roles: ['ADMIN', 'QA', 'LOGISTICA', 'TI'] },

  // Vista General Unificada
  { href: '/dashboard/trazabilidad', label: 'Resumen Trazabilidad', icon: Activity, roles: ['RECEPCION', 'CALIDAD', 'QA', 'PRODUCCION', 'LOGISTICA', 'ADMIN'] },

  // Los 5 Módulos de Trazabilidad Independientes
  { href: '/dashboard/recepcion', label: 'Recepción y Descarga', icon: Anchor, roles: ['RECEPCION', 'ADMIN'] },
  { href: '/dashboard/clasificacion', label: 'Clasificación y Selección', icon: Clipboard, roles: ['CALIDAD', 'QA', 'ADMIN'] },
  { href: '/dashboard/procesamiento', label: 'Procesamiento', icon: Layers, roles: ['PRODUCCION', 'ADMIN'] },
  { href: '/dashboard/congelamiento', label: 'Congelamiento y Frío', icon: Snowflake, roles: ['PRODUCCION', 'CALIDAD', 'QA', 'ADMIN'] },
  { href: '/dashboard/despacho', label: 'Despacho y Exportación', icon: Truck, roles: ['LOGISTICA', 'ADMIN'] },
  { href: '/dashboard/auditoria', label: 'Auditoría & Timeline', icon: FileText, roles: ['RECEPCION', 'CALIDAD', 'QA', 'PRODUCCION', 'LOGISTICA', 'ADMIN'] },

  { href: '/dashboard/certificaciones', label: 'Certificaciones', icon: FileCheck, roles: ['ADMIN', 'QA', 'LOGISTICA'] },
  { href: '/dashboard/especies', label: 'Especies', icon: BookOpen, roles: ['ADMIN'] },
  { href: '/dashboard/usuarios', label: 'Usuarios', icon: Users, roles: ['ADMIN'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab')
  const usuario = useAuthStore(s => s.usuario)

  const [hovered, setHovered] = useState(false)
  const isExpanded = hovered

  return (
    /* Contenedor estático para reservar el espacio de 64px (w-16) y evitar que el contenido empuje */
    <div
      className={cn(
        "hidden md:block w-16 h-full relative shrink-0 transition-all duration-200",
        isExpanded ? "z-50" : "z-30"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <aside
        className={cn(
          'absolute left-0 top-0 h-full flex flex-col bg-slate-900 text-white transition-all duration-200 ease-in-out border-r border-slate-800 shadow-md',
          isExpanded ? 'w-64 z-50' : 'w-16 z-30'
        )}
      >
        {/* Cabecera Sidebar */}
        <div className={cn('h-16 flex items-center gap-2.5 px-4 border-b border-slate-800 transition-all duration-200', !isExpanded && 'justify-center')}>
          <div className="bg-slate-800 p-1.5 rounded border border-slate-700">
            <Fish className="h-6 w-6 text-blue-500 shrink-0" />
          </div>
          {isExpanded && (
            <span className="font-bold text-base tracking-wide text-slate-100 transition-opacity duration-200 whitespace-nowrap">
              ExporTrace Ica
            </span>
          )}
        </div>

        {/* Menú de Navegación */}
        <nav className="flex-1 p-2 space-y-1 mt-4">
          {menuItems.filter(item => usuario && item.roles.includes(usuario.rol)).map((item) => {
            const itemUrl = new URL(item.href, 'http://localhost')
            const itemPath = itemUrl.pathname
            const itemTab = itemUrl.searchParams.get('tab')
            const active = pathname === itemPath && (!itemTab || currentTab === itemTab)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-150 group relative',
                  active
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
                  !isExpanded && 'justify-center'
                )}
                title={!isExpanded ? item.label : undefined}
              >
                <item.icon className={cn('h-5 w-5 shrink-0', active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200')} />
                {isExpanded && <span className="text-sm whitespace-nowrap">{item.label}</span>}

                {!isExpanded && (
                  <span className="absolute left-14 bg-slate-950 border border-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50">
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>
    </div>
  )
}

