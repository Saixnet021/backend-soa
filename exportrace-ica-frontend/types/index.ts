export type Rol = 'ADMIN' | 'QA' | 'LOGISTICA' | 'TI'
export type EstadoSanipes = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'APTO_EXPORTACION'
export type EstadoCadenaFrio = 'OK' | 'ALERTA' | 'RUPTURA'

export interface Usuario {
  id: number
  username: string
  rol: Rol
}

export interface AuthResponse {
  token: string
}

export interface Especie {
  id: number
  codigoSanipes: string
  nombreComun: string
  nombreCientifico: string
  tempMinCelsius: number
  tempMaxCelsius: number
  enVeda: boolean
}

export interface LotePesca {
  id: number
  codigoLote: string
  especie: string
  nombreEmbarcacion: string
  matriculaEmbarcacion?: string
  capitanEmbarcacion?: string
  empresaRazonSocial?: string
  empresaRuc?: string
  pesoKg: number
  fechaRecepcion: string
  estadoSanipes: EstadoSanipes
  estadoCadenaFrio: EstadoCadenaFrio
}

export interface AuditoriaCalidad {
  id: number
  idLote: number
  idInspector: number
  timestampMedicion: string
  temperaturaCelsius: number
  idCamara: string
  observaciones?: string
}

export interface ResumenFrio {
  tempMin: number
  tempMax: number
  tempPromedio: number
  hayAlerta: boolean
  estadoCadenaFrio: EstadoCadenaFrio
}

export interface TramiteSanipes {
  id: number
  idLote: number
  fechaSolicitud: string
  estadoTramite: 'INICIADO' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO'
  numeroCertificado?: string
  observacionSanipes?: string
  fechaAprobacion?: string
}

export interface ExpedienteCertificado {
  lote: LotePesca
  resumenFrio: ResumenFrio
  tramite: TramiteSanipes
  qrData: string
  aptoParaExportacion: boolean
}

export interface ReglaCalidad {
  id: number
  codigoEspecie: string
  tempMinAlerta: number
  tempMaxAlerta: number
  accionAlerta: 'EMAIL' | 'PUSH' | 'BLOQUEO_DESPACHO'
}

export const LOTES_MOCK: LotePesca[] = [
  { id: 1, codigoLote: "LOT-2026-001", especie: "POTA", nombreEmbarcacion: "Don Ramiro III", matriculaEmbarcacion: "DR-1001", capitanEmbarcacion: "Ramiro Quispe", empresaRazonSocial: "Pesquera Ramiro S.A.C.", empresaRuc: "20500000001", pesoKg: 500, fechaRecepcion: "2026-06-15T03:30:00", estadoSanipes: "APROBADO", estadoCadenaFrio: "OK" },
  { id: 2, codigoLote: "LOT-2026-002", especie: "PERICO", nombreEmbarcacion: "Santa Rosa II", matriculaEmbarcacion: "SR-2002", capitanEmbarcacion: "Luis Torres", empresaRazonSocial: "Marítima Santa Rosa S.A.C.", empresaRuc: "20600000002", pesoKg: 320, fechaRecepcion: "2026-06-15T07:00:00", estadoSanipes: "PENDIENTE", estadoCadenaFrio: "ALERTA" },
  { id: 3, codigoLote: "LOT-2026-003", especie: "POTA", nombreEmbarcacion: "Virgen del Carmen", matriculaEmbarcacion: "VC-3003", capitanEmbarcacion: "Julio Córdova", empresaRazonSocial: "Servicios Pesqueros del Sur E.I.R.L.", empresaRuc: "20400000003", pesoKg: 780, fechaRecepcion: "2026-06-14T22:00:00", estadoSanipes: "APTO_EXPORTACION", estadoCadenaFrio: "OK" },
]

export const ESPECIES_MOCK: Especie[] = [
  { id: 1, codigoSanipes: "ESP-001", nombreComun: "POTA", nombreCientifico: "Dosidicus gigas", tempMinCelsius: -18, tempMaxCelsius: -15, enVeda: false },
  { id: 2, codigoSanipes: "ESP-002", nombreComun: "PERICO", nombreCientifico: "Coryphaena hippurus", tempMinCelsius: -18, tempMaxCelsius: -14, enVeda: false },
  { id: 3, codigoSanipes: "ESP-005", nombreComun: "CABALLA", nombreCientifico: "Scomber japonicus", tempMinCelsius: -19, tempMaxCelsius: -15, enVeda: true },
]
