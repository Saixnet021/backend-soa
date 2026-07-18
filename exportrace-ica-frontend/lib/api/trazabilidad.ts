import api from './axios'

export interface RecepcionRequest {
  numeroDER: string
  nombreEmbarcacion: string
  matriculaEmbarcacion: string
  especie: 'POTA' | 'PERICO'
  pesoBrutoBascula: number
  temperaturaLlegada: number
  guiaRemisionRemitente: string
  turno: 'MAÑANA' | 'TARDE' | 'NOCHE'
}

export interface RecepcionResponse {
  idTicket: number
  numeroDER: string
  nombreEmbarcacion: string
  matriculaEmbarcacion: string
  especie: 'POTA' | 'PERICO'
  pesoBrutoBascula: number
  temperaturaLlegada: number
  guiaRemisionRemitente: string
  turno: 'MAÑANA' | 'TARDE' | 'NOCHE'
  nombreResponsable: string
  fechaHoraIngreso: string
  estado: string
  colorHex: string
  emoji: string
}

export interface ClasificacionRequest {
  loteOrigenId: number
  evaluacionSensorial: 'FIRME' | 'OLOR_CARACTERISTICO' | 'COLOR_NORMAL'
  calibreTalla: 'S' | 'M' | 'L' | 'XL' | 'MIXTO'
  kilosMermaDescarte: number
  motivoRechazo?: string
  firmaQA: string
  estado: 'APROBADO_CORTE' | 'RECHAZADO_TOTAL' | 'OBSERVADO'
}

export interface ClasificacionResponse {
  id: number
  loteOrigen: RecepcionResponse
  evaluacionSensorial: 'FIRME' | 'OLOR_CARACTERISTICO' | 'COLOR_NORMAL'
  calibreTalla: 'S' | 'M' | 'L' | 'XL' | 'MIXTO'
  kilosMermaDescarte: number
  motivoRechazo?: string
  nombreInspectorQA: string
  pesoUtil: number
  mermaTotal: number
  firmaQA: string
  estado: string
  colorHex: string
  emoji: string
}

export interface ProcesamientoRequest {
  loteOrigenId: number
  tipoCorte: 'FILETE' | 'ANILLAS' | 'ENTERO'
  tratamientoQuimico: 'ADITIVO' | 'NATURAL'
  tipoEmpaque: 'SACO_20KG' | 'CAJA_MASTER_10KG'
  cantidadBultosCajas: number
  pesoNetoFinal: number
  lineaProceso: string
}

export interface ProcesamientoResponse {
  id: number
  loteOrigen: ClasificacionResponse
  tipoCorte: 'FILETE' | 'ANILLAS' | 'ENTERO'
  tratamientoQuimico: 'ADITIVO' | 'NATURAL'
  tipoEmpaque: 'SACO_20KG' | 'CAJA_MASTER_10KG'
  cantidadBultosCajas: number
  pesoNetoFinal: number
  lineaProceso: string
  nombreSupervisor: string
  idLoteProduccion: string
  porcentajeRendimiento: number
  estado: string
  colorHex: string
  emoji: string
}

export interface CongelamientoTunelRequest {
  loteOrigenId: number
  numeroTunel: string
  fechaHoraIngresoTunel: string
  fechaHoraSalidaTunel: string
  temperaturaCentroTermico: number
  metodoCongelamiento?: string
  numeroEquipoFrio?: string
  porcentajeGlaseado?: number
  tipoEmpaquePrimario?: string
  tipoEmpaqueSecundario?: string
  pesoBrutoCaja?: number
  pesoNetoDeclarado?: number
  cantidadCajasFinales?: number
  zunchoSeguridad?: boolean
}

export interface CongelamientoCamaraRequest {
  loteOrigenId: number
  camaraDestino: string
  fechaHoraIngresoCamara: string
  fechaProgramadaDespacho: string
  estadoInocuidadHACCP: 'APTO' | 'RETENIDO'
  tipoPallet?: string
  ubicacionRack?: string
  estadoLiberacionHaccp?: string
  pasoDetectorMetales?: string
  pruebaPatronDetector?: boolean
  operarioDetector?: string
  nivelHistaminaPpm?: number
  pruebaTvbn?: number
  saborResidualAcido?: string
  analisisMicrobiologico?: string
}

export interface CongelamientoResponse {
  id: number
  loteOrigen: ProcesamientoResponse
  numeroTunel: string
  fechaHoraIngresoTunel: string
  fechaHoraSalidaTunel: string
  temperaturaCentroTermico: number
  nombreOperarioTunel: string
  nombreInspectorQAFrio: string
  metodoCongelamiento?: string
  numeroEquipoFrio?: string
  porcentajeGlaseado?: number
  tipoEmpaquePrimario?: string
  tipoEmpaqueSecundario?: string
  pesoBrutoCaja?: number
  pesoNetoDeclarado?: number
  cantidadCajasFinales?: number
  zunchoSeguridad?: boolean
  pasoDetectorMetales?: string
  pruebaPatronDetector?: boolean
  operarioDetector?: string
  nivelHistaminaPpm?: number
  pruebaTvbn?: number
  saborResidualAcido?: string
  analisisMicrobiologico?: string
  tipoPallet?: string
  ubicacionRack?: string
  estadoLiberacionHaccp?: string
  camaraDestino?: string
  fechaHoraIngresoCamara?: string
  fechaProgramadaDespacho?: string
  estadoInocuidadHACCP?: 'APTO' | 'RETENIDO'
  fechaVencimiento?: string
  estado: string
  colorHex: string
  emoji: string
}

export interface DespachoRequest {
  loteId: number
  rucCliente: string
  razonSocialCliente?: string
  puertoDestino: string
  reservaNaviera: string
  numeroContenedorFrigorifico: string
  precintosAduanerosNavieros: string
  temperaturaSeteoContenedor: number
  numeroDUS: string
  codigoCertificadoSanitario: string
  estado: 'STOCK_DISPONIBLE' | 'DESPACHADO_EN_TRANSITO'
}

export interface DespachoResponse {
  id: number
  lote: CongelamientoResponse
  rucCliente: string
  razonSocialCliente: string
  puertoDestino: string
  reservaNaviera: string
  numeroContenedorFrigorifico: string
  precintosAduanerosNavieros: string
  temperaturaSeteoContenedor: number
  numeroDUS: string
  codigoCertificadoSanitario: string
  nombreDespachador: string
  estado: string
  colorHex: string
  emoji: string
}

export interface TrazabilidadCompleta {
  recepcion: RecepcionResponse
  clasificacion?: ClasificacionResponse
  procesamiento?: ProcesamientoResponse
  congelamiento?: CongelamientoResponse
  despacho?: DespachoResponse
}

export const getRecepciones = () =>
  api.get<RecepcionResponse[]>('/api/recepcion').then((r) => r.data)

export const registrarRecepcion = (data: RecepcionRequest) =>
  api.post<RecepcionResponse>('/api/recepcion', data).then((r) => r.data)

export const getClasificaciones = (incluirRechazados = false) =>
  api.get<ClasificacionResponse[]>(`/api/clasificacion?incluirRechazados=${incluirRechazados}`).then((r) => r.data)

export const registrarClasificacion = (data: ClasificacionRequest) =>
  api.post<ClasificacionResponse>('/api/clasificacion', data).then((r) => r.data)

export const getProcesamientos = () =>
  api.get<ProcesamientoResponse[]>('/api/procesamiento').then((r) => r.data)

export const registrarProcesamiento = (data: ProcesamientoRequest) =>
  api.post<ProcesamientoResponse>('/api/procesamiento', data).then((r) => r.data)

export const registrarTunel = (data: CongelamientoTunelRequest) =>
  api.post<CongelamientoResponse>('/api/congelamiento/tunel', data).then((r) => r.data)

export const registrarCamara = (data: CongelamientoCamaraRequest) =>
  api.post<CongelamientoResponse>('/api/congelamiento/camara', data).then((r) => r.data)

export const getCongelamientos = () =>
  api.get<CongelamientoResponse[]>('/api/congelamiento').then((r) => r.data)

export const getDisponiblesDespacho = () =>
  api.get<CongelamientoResponse[]>('/api/despacho/disponibles').then((r) => r.data)

export const registrarDespacho = (data: DespachoRequest) =>
  api.post<DespachoResponse>('/api/despacho', data).then((r) => r.data)

export const getTrazabilidadCompleta = (loteId: number) =>
  api.get<TrazabilidadCompleta>(`/api/despacho/${loteId}/trazabilidad`).then((r) => r.data)

export const consultarRuc = (ruc: string) =>
  api.get<any>(`/api/v1/consultas/ruc/${ruc}`).then((r) => ({
    razonSocial: r.data?.razon_social || r.data?.razonSocial || ''
  }))

