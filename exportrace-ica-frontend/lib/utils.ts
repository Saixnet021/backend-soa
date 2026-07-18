import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function decodeJwt(token: string): { sub: string; rol: string; id?: number } | null {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return { sub: decoded.sub, rol: decoded.rol, id: decoded.id }
  } catch {
    return null
  }
}

export function calcularTiempoEnPlanta(fechaRecepcion?: string, fechaSalidaLote?: string): string | null {
  if (!fechaRecepcion || !fechaSalidaLote) return null
  const inicio = new Date(fechaRecepcion).getTime()
  const fin = new Date(fechaSalidaLote).getTime()
  if (isNaN(inicio) || isNaN(fin)) return null
  const diffMs = fin - inicio
  if (diffMs < 0) return null
  const horas = Math.floor(diffMs / (1000 * 60 * 60))
  const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (minutos === 0) return `${horas} horas`
  return `${horas} horas ${minutos} minutos`
}

export function formatShortDateTime(dateStr?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const hora = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${dia}/${mes} ${hora}:${min}`
}

export function formatEstado(estado?: string | null): string {
  if (!estado) return ''
  return estado.replace(/_/g, ' ')
}
