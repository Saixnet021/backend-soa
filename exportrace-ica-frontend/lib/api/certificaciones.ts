import api from './axios'
import type { TramiteSanipes, ExpedienteCertificado } from '@/types'

export async function solicitarCertificado(idLote: number): Promise<TramiteSanipes> {
  const { data } = await api.post<TramiteSanipes>(`/api/v1/orch/sanipes-check/${idLote}`)
  return data
}

export async function getExpediente(idLote: number): Promise<ExpedienteCertificado> {
  const { data } = await api.get<ExpedienteCertificado>(`/api/v1/orch/expediente-certificado/${idLote}`)
  return data
}

export async function getTramitesPorLote(idLote: number): Promise<TramiteSanipes[]> {
  const { data } = await api.get<TramiteSanipes[]>(`/api/v1/tramites/lote/${idLote}`)
  return data
}
