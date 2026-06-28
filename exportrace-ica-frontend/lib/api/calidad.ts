import api from './axios'
import type { AuditoriaCalidad, ResumenFrio, ReglaCalidad } from '@/types'

export async function registrarTemperatura(data: Omit<AuditoriaCalidad, 'id'>): Promise<AuditoriaCalidad> {
  const { data: res } = await api.post<AuditoriaCalidad>('/api/v1/calidad/temperaturas', data)
  return res
}

export async function getTemperaturasPorLote(idLote: number): Promise<AuditoriaCalidad[]> {
  const { data } = await api.get<AuditoriaCalidad[]>(`/api/v1/calidad/temperaturas/lote/${idLote}`)
  return data
}

export async function getResumenFrio(idLote: number): Promise<ResumenFrio> {
  const { data } = await api.get<ResumenFrio>(`/api/v1/calidad/temperaturas/lote/${idLote}/resumen`)
  return data
}

export async function getReglas(): Promise<ReglaCalidad[]> {
  const { data } = await api.get<ReglaCalidad[]>('/api/v1/calidad/reglas')
  return data
}

export async function crearRegla(data: Omit<ReglaCalidad, 'id'>): Promise<ReglaCalidad> {
  const { data: res } = await api.post<ReglaCalidad>('/api/v1/calidad/reglas', data)
  return res
}
