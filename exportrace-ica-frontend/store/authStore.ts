import { create } from 'zustand'
import type { Usuario, Rol } from '@/types'
import { decodeJwt } from '@/lib/utils'

interface AuthState {
  token: string | null
  usuario: Usuario | null
  isAuthenticated: boolean
  loginAction: (token: string) => void
  logout: () => void
  hasRole: (...roles: Rol[]) => boolean
}

let initialToken: string | null = null
let initialUsuario: Usuario | null = null

if (typeof window !== 'undefined') {
  initialToken = localStorage.getItem('token')
  const userStr = localStorage.getItem('usuario')
  if (userStr) {
    try {
      initialUsuario = JSON.parse(userStr)
    } catch (_) {}
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initialToken,
  usuario: initialUsuario,
  isAuthenticated: !!initialToken,

  loginAction: (token: string) => {
    const decoded = decodeJwt(token)
    const usuario: Usuario = {
      id: decoded?.id || 1,
      username: decoded?.sub || '',
      rol: (decoded?.rol as Rol) || 'LOGISTICA',
    }
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', JSON.stringify(usuario))
    document.cookie = `token=${token}; path=/; max-age=28800`
    set({ token, usuario, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    document.cookie = 'token=; path=/; max-age=0'
    set({ token: null, usuario: null, isAuthenticated: false })
  },

  hasRole: (...roles: Rol[]) => {
    const user = get().usuario
    if (!user) return false
    return roles.includes(user.rol)
  },
}))
