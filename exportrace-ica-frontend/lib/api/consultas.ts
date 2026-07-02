import api from './axios'

export interface DecolectaRucResponse {
  razonSocial: string
  numeroDocumento: string
  estado: string
  condicion: string
  direccion: string
  distrito: string
  provincia: string
  departamento: string
  tipo: string
  actividadEconomica: string
}

export async function consultarRuc(numero: string): Promise<DecolectaRucResponse> {
  const { data } = await api.get(`/api/v1/consultas/ruc/${numero}`)
  return {
    razonSocial: data.razon_social || data.razonSocial || '',
    numeroDocumento: data.numero_documento || data.numeroDocumento || '',
    estado: data.estado || '',
    condicion: data.condicion || '',
    direccion: data.direccion || '',
    distrito: data.distrito || '',
    provincia: data.provincia || '',
    departamento: data.departamento || '',
    tipo: data.tipo || '',
    actividadEconomica: data.actividad_economica || data.actividadEconomica || '',
  }
}
