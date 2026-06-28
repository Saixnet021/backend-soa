'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fish, LayoutDashboard, Thermometer, FileCheck, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/lotes', label: 'Lotes', icon: Fish },
  { href: '/dashboard/calidad', label: 'Calidad', icon: Thermometer },
  { href: '/dashboard/certificaciones', label: 'Cert.', icon: FileCheck },
]

export default function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-40 flex justify-around py-2">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} className={cn('flex flex-col items-center gap-0.5 px-3 py-1 text-xs', active ? 'text-primary' : 'text-gray-500')}>
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button onClick={() => setOpen(!open)} className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-gray-500">
          <Menu className="h-5 w-5" />
          <span>Más</span>
        </button>
      </nav>
      {open && (
        <div className="md:hidden fixed inset-0 bg-black/50 z-50" onClick={() => setOpen(false)}>
          <div className="absolute bottom-16 left-4 right-4 bg-white rounded-lg shadow-lg p-4" onClick={e => e.stopPropagation()}>
            <MobileMenu onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const usuario = useAuthStore(s => s.usuario)
  return (
    <div className="space-y-2">
      {usuario && (usuario.rol === 'ADMIN') && (
        <>
          <Link href="/dashboard/especies" onClick={onClose} className="block px-3 py-2 rounded hover:bg-slate-100 text-sm">Especies</Link>
          <Link href="/dashboard/usuarios" onClick={onClose} className="block px-3 py-2 rounded hover:bg-slate-100 text-sm">Usuarios</Link>
        </>
      )}
    </div>
  )
}
