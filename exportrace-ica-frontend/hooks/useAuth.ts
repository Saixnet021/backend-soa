'use client'
import { useAuthStore } from '@/store/authStore'
import { login } from '@/lib/api/auth'
import type { Rol } from '@/types'

export function useAuth() {
  const { usuario, isAuthenticated, loginAction, logout, hasRole } = useAuthStore()

  const handleLogin = async (username: string, password: string) => {
    const res = await login(username, password)
    const token = res.token.replace('Bearer ', '')
    loginAction(token)
  }

  return { usuario, isAuthenticated, login: handleLogin, logout, hasRole }
}
