'use client'
import { useAuthStore } from '@/store/authStore'
import { useNotificacionesStore } from '@/store/notificacionesStore'
import { Bell, Menu, User, LogOut } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TopbarProps {
  title: string
  onMenuClick?: () => void
}

export default function Topbar({ title, onMenuClick }: TopbarProps) {
  const { usuario, logout } = useAuthStore()
  const alertasCount = useNotificacionesStore((s) => s.alertasCount)
  const roleBadgeVariant = usuario?.rol === 'ADMIN' ? 'danger' : usuario?.rol === 'QA' ? 'success' : usuario?.rol === 'LOGISTICA' ? 'info' : 'gray'

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button onClick={onMenuClick} className="md:hidden text-slate-600 hover:text-slate-900">
            <Menu className="h-6 w-6" />
          </button>
        )}
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Alertas */}
        <button className="relative p-1 rounded-full hover:bg-slate-100 transition-colors">
          <Bell className="h-5 w-5 text-slate-600" />
          {alertasCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {alertasCount}
            </span>
          )}
        </button>

        {/* Sección de Usuario */}
        {usuario && (
          <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <User className="h-4 w-4" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-slate-800 leading-none">{usuario.username}</p>
                <span className="text-[10px] text-slate-400 font-medium uppercase">{usuario.rol}</span>
              </div>
              <Badge variant={roleBadgeVariant} className="text-[9px] py-0 px-1.5 uppercase font-bold sm:hidden">
                {usuario.rol}
              </Badge>
            </div>

            {/* Botón de Cerrar Sesión */}
            <button 
              onClick={logout} 
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-650 transition-colors py-1.5 px-2.5 rounded hover:bg-slate-50 border border-transparent hover:border-slate-200"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
