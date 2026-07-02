import api from './axios'
import type { LotePesca, Especie } from '@/types'

export async function getLotes(): Promise<LotePesca[]> {
  const { data } = await api.get<LotePesca[]>('/api/v1/adaptadores/sip/lotes')
  return data
}

export async function getLoteById(id: number): Promise<LotePesca> {
  const { data } = await api.get<LotePesca>(`/api/v1/adaptadores/sip/lotes/${id}`)
  return data
}

export async function crearLote(lote: Omit<LotePesca, 'id' | 'estadoSanipes' | 'estadoCadenaFrio' | 'fechaRecepcion'> & { fechaRecepcion: string }): Promise<LotePesca> {
  const { data } = await api.post<LotePesca>('/api/v1/adaptadores/sip/lotes', lote)
  return data
}

export async function registrarFechaSalida(id: number, fechaSalidaLote: string): Promise<LotePesca> {
  const { data } = await api.post<LotePesca>(`/api/v1/adaptadores/sip/lotes/${id}/fecha-salida`, { fechaSalidaLote })
  return data
}

export async function getEspecies(): Promise<Especie[]> {
  const { data } = await api.get<Especie[]>('/api/v1/maestros/especies')
  return data
}

export async function actualizarVedaEspecie(id: number, enVeda: boolean): Promise<Especie> {
  const { data } = await api.put<Especie>(`/api/v1/maestros/especies/${id}/veda?enVeda=${enVeda}`)
  return data
}
