'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import {
  getRecepciones,
  registrarRecepcion,
  getClasificaciones,
  registrarClasificacion,
  getProcesamientos,
  registrarProcesamiento,
  registrarTunel,
  registrarCamara,
  getCongelamientos,
  getDisponiblesDespacho,
  registrarDespacho,
  getTrazabilidadCompleta,
  consultarRuc,
  RecepcionResponse,
  ClasificacionResponse,
  ProcesamientoResponse,
  CongelamientoResponse,
  DespachoResponse,
  TrazabilidadCompleta
} from '@/lib/api/trazabilidad'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Anchor,
  Activity,
  Clipboard,
  Layers,
  Thermometer,
  Snowflake,
  Truck,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Search,
  ShieldAlert,
  X,
  Cpu,
  ShieldCheck
} from 'lucide-react'
import { formatEstado } from '@/lib/utils'

export default function TrazabilidadPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')

  // Navigation
  const [activeTab, setActiveTab] = useState<'recepcion' | 'clasificacion' | 'procesamiento' | 'congelamiento' | 'despacho' | 'auditoria'>('recepcion')

  useEffect(() => {
    if (tabParam && ['recepcion', 'clasificacion', 'procesamiento', 'congelamiento', 'despacho', 'auditoria'].includes(tabParam)) {
      setActiveTab(tabParam as any)
    }
  }, [tabParam])

  // Lists
  const [recepciones, setRecepciones] = useState<RecepcionResponse[]>([])
  const [clasificaciones, setClasificaciones] = useState<ClasificacionResponse[]>([])
  const [procesamientos, setProcesamientos] = useState<ProcesamientoResponse[]>([])
  const [congelamientos, setCongelamientos] = useState<CongelamientoResponse[]>([])
  const [disponiblesDespacho, setDisponiblesDespacho] = useState<CongelamientoResponse[]>([])

  const [loading, setLoading] = useState(true)

  // Modals & Timelines
  const [selectedLoteId, setSelectedLoteId] = useState<number | null>(null)
  const [trazabilidad, setTrazabilidad] = useState<TrazabilidadCompleta | null>(null)
  const [verTimelineModal, setVerTimelineModal] = useState(false)

  // Loading data
  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [recs, classifs, procs, congs, disps] = await Promise.all([
        getRecepciones(),
        getClasificaciones(true),
        getProcesamientos(),
        getCongelamientos(),
        getDisponiblesDespacho()
      ])
      setRecepciones(recs)
      setClasificaciones(classifs)
      setProcesamientos(procs)
      setCongelamientos(congs)
      setDisponiblesDespacho(disps)
    } catch (err: any) {
      toast.error('Error al cargar datos de trazabilidad')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // Modulo 1: Recepcion Form
  const [formRecepcion, setFormRecepcion] = useState({
    numeroDER: '',
    nombreEmbarcacion: '',
    matriculaEmbarcacion: '',
    especie: 'POTA' as 'POTA' | 'PERICO',
    pesoBrutoBascula: 0,
    temperaturaLlegada: 0,
    guiaRemisionRemitente: '',
    turno: 'MAÑANA' as 'MAÑANA' | 'TARDE' | 'NOCHE'
  })

  const submitRecepcion = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registrarRecepcion(formRecepcion)
      toast.success('Recepción registrada exitosamente')
      cargarDatos()
      setFormRecepcion({
        numeroDER: '',
        nombreEmbarcacion: '',
        matriculaEmbarcacion: '',
        especie: 'POTA',
        pesoBrutoBascula: 0,
        temperaturaLlegada: 0,
        guiaRemisionRemitente: '',
        turno: 'MAÑANA'
      })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar recepción')
    }
  }

  // Modulo 2: Clasificacion Form
  const [formClasificacion, setFormClasificacion] = useState({
    loteOrigenId: 0,
    evaluacionSensorial: 'FIRME' as 'FIRME' | 'OLOR_CARACTERISTICO' | 'COLOR_NORMAL',
    calibreTalla: 'S' as 'S' | 'M' | 'L' | 'XL' | 'MIXTO',
    kilosMermaDescarte: 0,
    motivoRechazo: '',
    firmaQA: '',
    estado: 'APROBADO_CORTE' as 'APROBADO_CORTE' | 'RECHAZADO_TOTAL' | 'OBSERVADO'
  })

  const submitClasificacion = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registrarClasificacion(formClasificacion)
      toast.success('Clasificación registrada con éxito')
      cargarDatos()
      setFormClasificacion({
        loteOrigenId: 0,
        evaluacionSensorial: 'FIRME',
        calibreTalla: 'M',
        kilosMermaDescarte: 0,
        motivoRechazo: '',
        firmaQA: '',
        estado: 'APROBADO_CORTE'
      })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar clasificación')
    }
  }

  // Modulo 3: Procesamiento Form
  const [formProcesamiento, setFormProcesamiento] = useState({
    loteOrigenId: 0,
    tipoCorte: 'FILETE' as 'FILETE' | 'ANILLAS' | 'ENTERO',
    tratamientoQuimico: 'ADITIVO' as 'ADITIVO' | 'NATURAL',
    tipoEmpaque: 'SACO_20KG' as 'SACO_20KG' | 'CAJA_MASTER_10KG',
    cantidadBultosCajas: 0,
    pesoNetoFinal: 0,
    lineaProceso: ''
  })

  const submitProcesamiento = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registrarProcesamiento(formProcesamiento)
      toast.success('Lote en sala de cortes registrado')
      cargarDatos()
      setFormProcesamiento({
        loteOrigenId: 0,
        tipoCorte: 'FILETE',
        tratamientoQuimico: 'ADITIVO',
        tipoEmpaque: 'SACO_20KG',
        cantidadBultosCajas: 0,
        pesoNetoFinal: 0,
        lineaProceso: ''
      })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar procesamiento')
    }
  }

  // Modulo 4: Congelamiento Form (Tunel y Camara)
  const [tunelForm, setTunelForm] = useState({
    loteOrigenId: 0,
    numeroTunel: '',
    fechaHoraIngresoTunel: '',
    fechaHoraSalidaTunel: '',
    temperaturaCentroTermico: 0,
    metodoCongelamiento: 'Túnel de Placas',
    numeroEquipoFrio: 'Placas N°1',
    porcentajeGlaseado: 0,
    tipoEmpaquePrimario: 'Bolsa de Polietileno',
    tipoEmpaqueSecundario: 'Caja Master de Cartón Corrugado',
    pesoBrutoCaja: 0,
    pesoNetoDeclarado: 0,
    cantidadCajasFinales: 0,
    zunchoSeguridad: false
  })

  const [camaraForm, setCamaraForm] = useState({
    loteOrigenId: 0,
    camaraDestino: '',
    fechaHoraIngresoCamara: '',
    fechaProgramadaDespacho: '',
    estadoInocuidadHACCP: 'APTO' as 'APTO' | 'RETENIDO',
    tipoPallet: 'Madera Fumigada',
    ubicacionRack: '',
    estadoLiberacionHaccp: 'LIBERADO',
    pasoDetectorMetales: 'Conforme',
    pruebaPatronDetector: true,
    operarioDetector: usuario?.username || '',
    nivelHistaminaPpm: undefined as number | undefined,
    pruebaTvbn: undefined as number | undefined,
    saborResidualAcido: 'Ausente',
    analisisMicrobiologico: 'Conforme'
  })

  const submitTunel = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const req = {
        ...tunelForm,
        fechaHoraIngresoTunel: new Date(tunelForm.fechaHoraIngresoTunel).toISOString(),
        fechaHoraSalidaTunel: new Date(tunelForm.fechaHoraSalidaTunel).toISOString(),
        numeroTunel: tunelForm.numeroEquipoFrio
      }
      await registrarTunel(req)
      toast.success('Congelamiento en Túnel registrado')
      cargarDatos()
      setTunelForm({
        loteOrigenId: 0,
        numeroTunel: '',
        fechaHoraIngresoTunel: '',
        fechaHoraSalidaTunel: '',
        temperaturaCentroTermico: 0,
        metodoCongelamiento: 'Túnel de Placas',
        numeroEquipoFrio: 'Placas N°1',
        porcentajeGlaseado: 0,
        tipoEmpaquePrimario: 'Bolsa de Polietileno',
        tipoEmpaqueSecundario: 'Caja Master de Cartón Corrugado',
        pesoBrutoCaja: 0,
        pesoNetoDeclarado: 0,
        cantidadCajasFinales: 0,
        zunchoSeguridad: false
      })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error en registro de túnel')
    }
  }

  const submitCamara = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const req = {
        ...camaraForm,
        fechaHoraIngresoCamara: new Date(camaraForm.fechaHoraIngresoCamara).toISOString(),
        operarioDetector: usuario?.username || ''
      }
      await registrarCamara(req)
      toast.success('Almacenamiento en Cámara registrado')
      cargarDatos()
      setCamaraForm({
        loteOrigenId: 0,
        camaraDestino: '',
        fechaHoraIngresoCamara: '',
        fechaProgramadaDespacho: '',
        estadoInocuidadHACCP: 'APTO',
        tipoPallet: 'Madera Fumigada',
        ubicacionRack: '',
        estadoLiberacionHaccp: 'LIBERADO',
        pasoDetectorMetales: 'Conforme',
        pruebaPatronDetector: true,
        operarioDetector: usuario?.username || '',
        nivelHistaminaPpm: undefined,
        pruebaTvbn: undefined,
        saborResidualAcido: 'Ausente',
        analisisMicrobiologico: 'Conforme'
      })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error en registro de cámara')
    }
  }

  // Modulo 5: Despacho Form
  const [formDespacho, setFormDespacho] = useState({
    loteId: 0,
    rucCliente: '',
    razonSocialCliente: '',
    puertoDestino: '',
    reservaNaviera: '',
    numeroContenedorFrigorifico: '',
    precintosAduanerosNavieros: '',
    temperaturaSeteoContenedor: -20.0,
    numeroDUS: '',
    codigoCertificadoSanitario: '',
    estado: 'DESPACHADO_EN_TRANSITO' as 'STOCK_DISPONIBLE' | 'DESPACHADO_EN_TRANSITO'
  })

  const [buscandoRuc, setBuscandoRuc] = useState(false)
  const [showRazonSocialManual, setShowRazonSocialManual] = useState(false)
  const [errorRuc, setErrorRuc] = useState('')

  // RUC Lookup watcher
  useEffect(() => {
    if (!formDespacho.rucCliente || formDespacho.rucCliente.length !== 11) {
      setErrorRuc('')
      setShowRazonSocialManual(false)
      return
    }
    if (!/^\d{11}$/.test(formDespacho.rucCliente)) return

    let cancelled = false
    setBuscandoRuc(true)
    setErrorRuc('')
    setShowRazonSocialManual(false)

    consultarRuc(formDespacho.rucCliente)
      .then((data) => {
        if (cancelled) return
        if (data?.razonSocial) {
          setFormDespacho((prev) => ({ ...prev, razonSocialCliente: data.razonSocial }))
          toast.success(`Cliente RUC autocompletado: ${data.razonSocial}`)
        } else {
          setErrorRuc('RUC no encontrado en SUNAT. Ingrese razón social manualmente.')
          setShowRazonSocialManual(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorRuc('Servicio externo de RUC caído / no disponible. Ingrese razón social manualmente.')
          setShowRazonSocialManual(true)
        }
      })
      .finally(() => {
        if (!cancelled) setBuscandoRuc(false)
      })

    return () => {
      cancelled = true
    }
  }, [formDespacho.rucCliente])

  const selectedCongelamiento = congelamientos.find((c) => c.loteOrigen.id === camaraForm.loteOrigenId)
  const especieLote = selectedCongelamiento?.loteOrigen?.loteOrigen?.loteOrigen?.especie

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'APTO_PARA_EXPORTACION':
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-2.5 py-0.5 text-[10px]">LIBERADO EXPORT.</Badge>
      case 'CUARENTENA':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold px-2.5 py-0.5 text-[10px]">CUARENTENA LAB</Badge>
      case 'NO_APTO_RETENIDO':
        return <Badge className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-2.5 py-0.5 text-[10px]">RECHAZO FDA</Badge>
      case 'EN_TUNEL':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-2.5 py-0.5 text-[10px]">EN TUNEL</Badge>
      default:
        return <Badge variant="gray">{formatEstado(estado)}</Badge>
    }
  }

  const renderLaboratorioCell = (c: CongelamientoResponse) => {
    const especie = c.loteOrigen?.loteOrigen?.loteOrigen?.especie
    if (!c.camaraDestino) {
      return <span className="text-slate-400 italic text-[11px]">Túnel en curso</span>
    }
    return (
      <div className="flex flex-col gap-0.5 text-[11px]">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-500">Micro:</span>
          <span className={c.analisisMicrobiologico === 'Conforme' ? 'text-green-600 font-bold' : c.analisisMicrobiologico === 'Contaminado' ? 'text-red-500 font-bold' : 'text-amber-500 font-medium'}>
            {c.analisisMicrobiologico || 'Pendiente'}
          </span>
        </div>
        {especie === 'PERICO' && (
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-500">Histamina:</span>
            {c.nivelHistaminaPpm !== undefined && c.nivelHistaminaPpm !== null ? (
              <span className={Number(c.nivelHistaminaPpm) > 50 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                {c.nivelHistaminaPpm} ppm
              </span>
            ) : (
              <span className="text-amber-500 font-medium">Pendiente</span>
            )}
          </div>
        )}
        {especie === 'POTA' && (
          <>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-500">TVB-N:</span>
              {c.pruebaTvbn !== undefined && c.pruebaTvbn !== null ? (
                <span className={Number(c.pruebaTvbn) > 30 ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                  {c.pruebaTvbn} mg
                </span>
              ) : (
                <span className="text-amber-500 font-medium">Pendiente</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-500">Sabor Ácido:</span>
              <span className={c.saborResidualAcido === 'Presente' ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                {c.saborResidualAcido || 'Ausente'}
              </span>
            </div>
          </>
        )}
      </div>
    )
  }

  const renderMetalesCell = (c: CongelamientoResponse) => {
    if (!c.camaraDestino) {
      return <span className="text-slate-400 italic text-[11px]">—</span>
    }
    const status = c.pasoDetectorMetales
    const patron = c.pruebaPatronDetector
    if (status === 'Conforme' && patron) {
      return <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50 text-green-700 font-bold text-[11px]">✅ Conforme</span>
    }
    return (
      <div className="flex flex-col text-[11px]">
        <span className="text-red-500 font-extrabold flex items-center gap-0.5">⚠️ Falla</span>
        <span className="text-slate-400 text-[10px]">{status || 'No conforme'}</span>
      </div>
    )
  }

  const renderUbicacionCell = (c: CongelamientoResponse) => {
    if (!c.camaraDestino) {
      return <span className="text-slate-400 italic text-[11px]">En túnel</span>
    }
    return (
      <div className="flex flex-col text-[11px] text-slate-700">
        <span className="font-semibold">{c.camaraDestino}</span>
        {c.ubicacionRack && <span>Rack: {c.ubicacionRack}</span>}
        {c.tipoPallet && <span className="text-slate-500 text-[10px]">{c.tipoPallet}</span>}
      </div>
    )
  }

  const submitDespacho = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registrarDespacho(formDespacho)
      toast.success('Despacho registrado correctamente')
      cargarDatos()
      setFormDespacho({
        loteId: 0,
        rucCliente: '',
        razonSocialCliente: '',
        puertoDestino: '',
        reservaNaviera: '',
        numeroContenedorFrigorifico: '',
        precintosAduanerosNavieros: '',
        temperaturaSeteoContenedor: -20.0,
        numeroDUS: '',
        codigoCertificadoSanitario: '',
        estado: 'DESPACHADO_EN_TRANSITO'
      })
      setShowRazonSocialManual(false)
      setErrorRuc('')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar despacho')
    }
  }

  // Timeline view handler
  const verTimeline = async (congelamientoId: number) => {
    setSelectedLoteId(congelamientoId)
    try {
      const data = await getTrazabilidadCompleta(congelamientoId)
      setTrazabilidad(data)
      setVerTimelineModal(true)
    } catch (err: any) {
      toast.error('Error al cargar la línea de tiempo')
    }
  }

  // PDF Download helpers
  const downloadPDF = (despachoId: number, tipo: 'packing-list' | 'guia-remision') => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/despacho/${despachoId}/pdf/${tipo}`

    // Fetch as blob to attach token correctly
    const token = localStorage.getItem('token')
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Error al descargar PDF')
        return res.blob()
      })
      .then(blob => {
        const link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = `${tipo}-${despachoId}.pdf`
        link.click()
        toast.success('PDF descargado exitosamente')
      })
      .catch(() => {
        toast.error('Error al generar PDF del despacho')
      })
  }

  const checkRole = (roles: string[]) => {
    if (!usuario) return false
    return roles.includes(usuario.rol)
  }

  if (loading) return <Skeleton className="h-96 w-full rounded-lg" />

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10 scale-150">
          <Activity className="w-96 h-96" />
        </div>
        <div className="relative z-10 space-y-2">
          <Badge className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold uppercase tracking-wider">
            Trazabilidad Completa
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Planta de Procesamiento Pesquero (Pota/Perico)
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm md:text-base leading-relaxed">
            Flujo secuencial end-to-end de control de inocuidad y exportación. Registre y supervise las fases desde el muelle de recepción hasta el despacho de exportación certificado por SANIPES.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b overflow-x-auto scrollbar-hide bg-slate-50 p-1.5 rounded-xl border">
        {[
          { key: 'recepcion', label: 'Recepción y Descarga (Muelle)', icon: Anchor, roles: ['RECEPCION', 'ADMIN'] },
          { key: 'clasificacion', label: 'Clasificación y Selección (Planta Crudos)', icon: Clipboard, roles: ['CALIDAD', 'QA', 'ADMIN'] },
          { key: 'procesamiento', label: 'Procesamiento (Sala de Cortes)', icon: Layers, roles: ['PRODUCCION', 'ADMIN'] },
          { key: 'congelamiento', label: 'Congelamiento y Almacenamiento (Cadena de Frío)', icon: Snowflake, roles: ['PRODUCCION', 'CALIDAD', 'QA', 'ADMIN'] },
          { key: 'despacho', label: 'Despacho y Exportación (SANIPES)', icon: Truck, roles: ['LOGISTICA', 'ADMIN'] },
          { key: 'auditoria', label: 'Auditoría & Timeline', icon: FileText, roles: ['RECEPCION', 'CALIDAD', 'QA', 'PRODUCCION', 'LOGISTICA', 'ADMIN'] }
        ].map((tab) => {
          const Icon = tab.icon
          const isSelected = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${isSelected
                  ? 'bg-indigo-950 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white border rounded-2xl shadow-sm p-6">

        {/* PANEL 1: RECEPCION */}
        {activeTab === 'recepcion' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Anchor className="text-indigo-600 h-5 w-5" /> Recepción y Descarga (Muelle)
            </h2>
            {checkRole(['RECEPCION', 'ADMIN']) ? (
              <form onSubmit={submitRecepcion} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Número DER</label>
                  <Input
                    required
                    value={formRecepcion.numeroDER}
                    onChange={(e) => setFormRecepcion({ ...formRecepcion, numeroDER: e.target.value })}
                    placeholder="Ej: DER-2026-1025"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Nombre Embarcación</label>
                  <Input
                    required
                    value={formRecepcion.nombreEmbarcacion}
                    onChange={(e) => setFormRecepcion({ ...formRecepcion, nombreEmbarcacion: e.target.value })}
                    placeholder="Ej: Mi San Martín"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Matrícula</label>
                  <Input
                    required
                    value={formRecepcion.matriculaEmbarcacion}
                    onChange={(e) => setFormRecepcion({ ...formRecepcion, matriculaEmbarcacion: e.target.value })}
                    placeholder="Ej: CO-10254-PM"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Especie</label>
                  <Select
                    value={formRecepcion.especie}
                    onChange={(e) => setFormRecepcion({ ...formRecepcion, especie: e.target.value as any })}
                  >
                    <option value="POTA">Pota (Dosidicus gigas)</option>
                    <option value="PERICO">Perico (Coryphaena hippurus)</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Peso Bruto Báscula (Kg)</label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={formRecepcion.pesoBrutoBascula || ''}
                    onChange={(e) => setFormRecepcion({ ...formRecepcion, pesoBrutoBascula: parseFloat(e.target.value) || 0 })}
                    placeholder="Ej: 2450.5"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Temperatura Llegada (°C)</label>
                  <Input
                    type="number"
                    step="0.1"
                    required
                    value={formRecepcion.temperaturaLlegada || ''}
                    onChange={(e) => setFormRecepcion({ ...formRecepcion, temperaturaLlegada: parseFloat(e.target.value) || 0 })}
                    placeholder="Ej: 4.2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Guía de Remisión Remitente</label>
                  <Input
                    required
                    value={formRecepcion.guiaRemisionRemitente}
                    onChange={(e) => setFormRecepcion({ ...formRecepcion, guiaRemisionRemitente: e.target.value })}
                    placeholder="Ej: T-002-1425"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Turno</label>
                  <Select
                    value={formRecepcion.turno}
                    onChange={(e) => setFormRecepcion({ ...formRecepcion, turno: e.target.value as any })}
                  >
                    <option value="MAÑANA">Mañana</option>
                    <option value="TARDE">Tarde</option>
                    <option value="NOCHE">Noche</option>
                  </Select>
                </div>
                <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                  <Button type="submit" className="bg-indigo-950 text-white font-semibold">
                    <Anchor className="h-4 w-4 mr-1.5" /> Registrar Recepción
                  </Button>
                </div>
              </form>
            ) : (
              <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <div>
                  <strong>Acceso Restringido:</strong> Solo usuarios con rol <strong>RECEPCION</strong> o <strong>ADMIN</strong> pueden ingresar nuevas recepciones.
                </div>
              </div>
            )}

            <h3 className="font-bold text-slate-700 text-sm mt-6">Historial de Recepciones en Muelle</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>N° DER / Guía</TableHead>
                  <TableHead>Embarcación & Matrícula</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>Peso Bruto</TableHead>
                  <TableHead>Temperatura</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recepciones.map((r) => (
                  <TableRow key={r.idTicket}>
                    <TableCell className="font-semibold text-indigo-950"># {r.idTicket}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-slate-800">{r.numeroDER}</span>
                        <span className="text-slate-500">Guía: {r.guiaRemisionRemitente}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-semibold text-slate-800">{r.nombreEmbarcacion}</span>
                        <span className="text-slate-500">Matrícula: {r.matriculaEmbarcacion}</span>
                      </div>
                    </TableCell>
                    <TableCell>{r.especie}</TableCell>
                    <TableCell>{r.pesoBrutoBascula} kg</TableCell>
                    <TableCell>
                      <Badge variant={r.temperaturaLlegada > 5 ? 'danger' : 'success'}>
                        {r.temperaturaLlegada} °C
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{r.nombreResponsable}</TableCell>
                    <TableCell>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: `${r.colorHex}20`, color: r.colorHex }}
                      >
                        {formatEstado(r.estado)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* PANEL 2: CLASIFICACION */}
        {activeTab === 'clasificacion' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Clipboard className="text-indigo-600 h-5 w-5" /> Clasificación y Selección (Planta Crudos)
            </h2>
            {checkRole(['CALIDAD', 'QA', 'ADMIN']) ? (
              <form onSubmit={submitClasificacion} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Lote Origen (Recepción PENDIENTE)</label>
                  <Select
                    value={formClasificacion.loteOrigenId}
                    onChange={(e) => setFormClasificacion({ ...formClasificacion, loteOrigenId: parseInt(e.target.value) || 0 })}
                  >
                    <option value="0">Seleccionar ticket...</option>
                    {recepciones
                      .filter((r) => r.estado === 'PENDIENTE_QA')
                      .map((r) => (
                        <option key={r.idTicket} value={r.idTicket}>
                          #{r.idTicket} - {r.nombreEmbarcacion} ({r.especie} - {r.pesoBrutoBascula} kg)
                        </option>
                      ))}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Evaluación Sensorial</label>
                  <Select
                    value={formClasificacion.evaluacionSensorial}
                    onChange={(e) => setFormClasificacion({ ...formClasificacion, evaluacionSensorial: e.target.value as any })}
                  >
                    <option value="FIRME">Firme (Fresco)</option>
                    <option value="OLOR_CARACTERISTICO">Olor Característico</option>
                    <option value="COLOR_NORMAL">Color Normal</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Talla / Calibre</label>
                  <Select
                    value={formClasificacion.calibreTalla}
                    onChange={(e) => setFormClasificacion({ ...formClasificacion, calibreTalla: e.target.value as any })}
                  >
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="MIXTO">Mixto</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Mermas / Descartes (Kg)</label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={formClasificacion.kilosMermaDescarte || ''}
                    onChange={(e) => setFormClasificacion({ ...formClasificacion, kilosMermaDescarte: parseFloat(e.target.value) || 0 })}
                    placeholder="Ej: 45.8"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Firma Inspector QA (Digital/Texto)</label>
                  <Input
                    required
                    value={formClasificacion.firmaQA}
                    onChange={(e) => setFormClasificacion({ ...formClasificacion, firmaQA: e.target.value })}
                    placeholder="Ej: ING. M. SALINAS"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Resultado Evaluación</label>
                  <Select
                    value={formClasificacion.estado}
                    onChange={(e) => setFormClasificacion({ ...formClasificacion, estado: e.target.value as any })}
                  >
                    <option value="APROBADO_CORTE">Aprobado para Corte</option>
                    <option value="OBSERVADO">Observado (Reprocesar)</option>
                    <option value="RECHAZADO_TOTAL">Rechazado Total</option>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Motivo Rechazo (Opcional)</label>
                  <Input
                    value={formClasificacion.motivoRechazo}
                    onChange={(e) => setFormClasificacion({ ...formClasificacion, motivoRechazo: e.target.value })}
                    placeholder="Detallar solo en caso de Rechazado/Observado"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                  <Button type="submit" className="bg-indigo-950 text-white font-semibold">
                    <Clipboard className="h-4 w-4 mr-1.5" /> Registrar Clasificación
                  </Button>
                </div>
              </form>
            ) : (
              <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <div>
                  <strong>Acceso Restringido:</strong> Solo usuarios con rol <strong>CALIDAD</strong> o <strong>ADMIN</strong> pueden clasificar lotes.
                </div>
              </div>
            )}

            <h3 className="font-bold text-slate-700 text-sm mt-6">Inspecciones de Calidad Realizadas</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lote ID</TableHead>
                  <TableHead>Ticket Origen</TableHead>
                  <TableHead>Evaluación / Talla</TableHead>
                  <TableHead>Peso Útil</TableHead>
                  <TableHead>Descarte/Merma</TableHead>
                  <TableHead>Inspector QA</TableHead>
                  <TableHead>Firma QA</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clasificaciones.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold text-indigo-950"># {c.id}</TableCell>
                    <TableCell>Ticket #{c.loteOrigen.idTicket} ({c.loteOrigen.nombreEmbarcacion})</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span>Sensorial: {c.evaluacionSensorial}</span>
                        <span className="font-semibold">Talla: {c.calibreTalla}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-green-700">{c.pesoUtil} kg</TableCell>
                    <TableCell>{c.mermaTotal} kg</TableCell>
                    <TableCell className="text-xs">{c.nombreInspectorQA}</TableCell>
                    <TableCell className="text-xs font-mono">{c.firmaQA}</TableCell>
                    <TableCell>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: `${c.colorHex}20`, color: c.colorHex }}
                      >
                        {formatEstado(c.estado)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* PANEL 3: PROCESAMIENTO */}
        {activeTab === 'procesamiento' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Layers className="text-indigo-600 h-5 w-5" /> Procesamiento (Sala de Cortes)
            </h2>
            {checkRole(['PRODUCCION', 'ADMIN']) ? (
              <form onSubmit={submitProcesamiento} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Lote de Origen (Calidad Aprobado/Observado)</label>
                  <Select
                    value={formProcesamiento.loteOrigenId}
                    onChange={(e) => setFormProcesamiento({ ...formProcesamiento, loteOrigenId: parseInt(e.target.value) || 0 })}
                  >
                    <option value="0">Seleccionar clasificación...</option>
                    {clasificaciones
                      .filter((c) => c.estado !== 'RECHAZADO_TOTAL')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          Clasificación #{c.id} ({c.loteOrigen.especie} - Útil: {c.pesoUtil} kg)
                        </option>
                      ))}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Tipo de Corte</label>
                  <Select
                    value={formProcesamiento.tipoCorte}
                    onChange={(e) => setFormProcesamiento({ ...formProcesamiento, tipoCorte: e.target.value as any })}
                  >
                    <option value="FILETE">Filete</option>
                    <option value="ANILLAS">Anillas</option>
                    <option value="ENTERO">Entero</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Tratamiento Químico</label>
                  <Select
                    value={formProcesamiento.tratamientoQuimico}
                    onChange={(e) => setFormProcesamiento({ ...formProcesamiento, tratamientoQuimico: e.target.value as any })}
                  >
                    <option value="NATURAL">Natural (Sin Aditivos)</option>
                    <option value="ADITIVO">Aditivo Permitido</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Tipo de Empaque</label>
                  <Select
                    value={formProcesamiento.tipoEmpaque}
                    onChange={(e) => setFormProcesamiento({ ...formProcesamiento, tipoEmpaque: e.target.value as any })}
                  >
                    <option value="CAJA_MASTER_10KG">Caja Master 10 Kg</option>
                    <option value="SACO_20KG">Saco de Polietileno 20 Kg</option>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Cantidad de Bultos/Cajas</label>
                  <Input
                    type="number"
                    required
                    value={formProcesamiento.cantidadBultosCajas || ''}
                    onChange={(e) => setFormProcesamiento({ ...formProcesamiento, cantidadBultosCajas: parseInt(e.target.value) || 0 })}
                    placeholder="Ej: 120"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Peso Neto Final (Kg)</label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    value={formProcesamiento.pesoNetoFinal || ''}
                    onChange={(e) => setFormProcesamiento({ ...formProcesamiento, pesoNetoFinal: parseFloat(e.target.value) || 0 })}
                    placeholder="Ej: 1195.5"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Línea de Proceso</label>
                  <Input
                    required
                    value={formProcesamiento.lineaProceso}
                    onChange={(e) => setFormProcesamiento({ ...formProcesamiento, lineaProceso: e.target.value })}
                    placeholder="Ej: Línea 01 - Cortes Especiales Pota"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                  <Button type="submit" className="bg-indigo-950 text-white font-semibold">
                    <Layers className="h-4 w-4 mr-1.5" /> Registrar en Producción
                  </Button>
                </div>
              </form>
            ) : (
              <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <div>
                  <strong>Acceso Restringido:</strong> Solo usuarios con rol <strong>PRODUCCION</strong> o <strong>ADMIN</strong> pueden ingresar en sala de cortes.
                </div>
              </div>
            )}

            <h3 className="font-bold text-slate-700 text-sm mt-6">Lotes Procesados</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lote Producción ID</TableHead>
                  <TableHead>Clasificación Origen</TableHead>
                  <TableHead>Corte / Aditivo</TableHead>
                  <TableHead>Empaque / Bultos</TableHead>
                  <TableHead>Peso Neto Final</TableHead>
                  <TableHead>Rendimiento</TableHead>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procesamientos.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold text-indigo-950 text-xs">{p.idLoteProduccion}</TableCell>
                    <TableCell>Calificación #{p.loteOrigen.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span>Corte: {p.tipoCorte}</span>
                        <span className="text-slate-500">{p.tratamientoQuimico}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span>{p.tipoEmpaque}</span>
                        <span className="font-semibold">{p.cantidadBultosCajas} Cajas/Sacos</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">{p.pesoNetoFinal} kg</TableCell>
                    <TableCell>
                      <Badge variant={p.porcentajeRendimiento < 60 ? 'warning' : 'success'}>
                        {p.porcentajeRendimiento} %
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{p.nombreSupervisor}</TableCell>
                    <TableCell>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: `${p.colorHex}20`, color: p.colorHex }}
                      >
                        {formatEstado(p.estado)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* PANEL 4: CONGELAMIENTO */}
        {activeTab === 'congelamiento' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Snowflake className="text-indigo-600 h-5 w-5" /> Congelamiento, Almacenamiento y Control Sanitario (HACCP)
            </h2>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* SUB-FORM 1: TUNEL */}
              <div className="border p-5 rounded-xl space-y-4 bg-slate-50 shadow-inner">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b pb-2">
                  <Thermometer className="h-4 w-4 text-indigo-600" /> Paso 1: Salida de Túnel, Glaseado y Empaque
                </h3>
                {checkRole(['PRODUCCION', 'ADMIN']) ? (
                  <form onSubmit={submitTunel} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Lote de Origen (Sala Cortes)</label>
                      <Select
                        value={tunelForm.loteOrigenId}
                        onChange={(e) => setTunelForm({ ...tunelForm, loteOrigenId: parseInt(e.target.value) || 0 })}
                      >
                        <option value="0">Seleccionar lote...</option>
                        {procesamientos
                          .filter((p) => p.estado === 'LISTO_PARA_ENFRIAR')
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.idLoteProduccion} ({p.loteOrigen.loteOrigen.especie} - {p.pesoNetoFinal} kg)
                            </option>
                          ))}
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Método de Congelamiento</label>
                        <Select
                          value={tunelForm.metodoCongelamiento}
                          onChange={(e) => setTunelForm({ ...tunelForm, metodoCongelamiento: e.target.value })}
                        >
                          <option value="Túnel de Placas">Túnel de Placas</option>
                          <option value="Túnel de Aire Forzado">Túnel de Aire Forzado</option>
                          <option value="Cámaras de Congelamiento Rápido">Cámaras de Congelamiento Rápido</option>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">N° Equipo de Frío</label>
                        <Input
                          required
                          value={tunelForm.numeroEquipoFrio}
                          onChange={(e) => setTunelForm({ ...tunelForm, numeroEquipoFrio: e.target.value })}
                          placeholder="Ej: Placas N°1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Temp. Centro Térmico (°C)</label>
                        <Input
                          type="number"
                          step="0.1"
                          required
                          value={tunelForm.temperaturaCentroTermico || ''}
                          onChange={(e) => setTunelForm({ ...tunelForm, temperaturaCentroTermico: parseFloat(e.target.value) || 0 })}
                          placeholder="Ej: -19.5"
                        />
                        <span className="text-[10px] text-slate-500">Mínimo para exportación: -18.0 °C</span>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Porcentaje Glaseado (%)</label>
                        <Input
                          type="number"
                          step="0.1"
                          required
                          value={tunelForm.porcentajeGlaseado || ''}
                          onChange={(e) => setTunelForm({ ...tunelForm, porcentajeGlaseado: parseFloat(e.target.value) || 0 })}
                          placeholder="Ej: 8.5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Empaque Primario</label>
                        <Select
                          value={tunelForm.tipoEmpaquePrimario}
                          onChange={(e) => setTunelForm({ ...tunelForm, tipoEmpaquePrimario: e.target.value })}
                        >
                          <option value="Bolsa de Polietileno">Bolsa de Polietileno</option>
                          <option value="Film Plástico">Film Plástico</option>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Empaque Secundario</label>
                        <Select
                          value={tunelForm.tipoEmpaqueSecundario}
                          onChange={(e) => setTunelForm({ ...tunelForm, tipoEmpaqueSecundario: e.target.value })}
                        >
                          <option value="Caja Master de Cartón Corrugado">Caja Master de Cartón</option>
                          <option value="Caja Máster de Cartón con Zuncho">Caja Máster con Zuncho</option>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Peso Bruto Caja (kg)</label>
                        <Input
                          type="number"
                          step="0.01"
                          required
                          value={tunelForm.pesoBrutoCaja || ''}
                          onChange={(e) => setTunelForm({ ...tunelForm, pesoBrutoCaja: parseFloat(e.target.value) || 0 })}
                          placeholder="Ej: 10.5"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Peso Neto Caja (kg)</label>
                        <Input
                          type="number"
                          step="0.01"
                          required
                          value={tunelForm.pesoNetoDeclarado || ''}
                          onChange={(e) => setTunelForm({ ...tunelForm, pesoNetoDeclarado: parseFloat(e.target.value) || 0 })}
                          placeholder="Ej: 10.0"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Cajas Producidas</label>
                        <Input
                          type="number"
                          required
                          value={tunelForm.cantidadCajasFinales || ''}
                          onChange={(e) => setTunelForm({ ...tunelForm, cantidadCajasFinales: parseInt(e.target.value) || 0 })}
                          placeholder="Ej: 250"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="zunchoSeguridadTab"
                          checked={tunelForm.zunchoSeguridad}
                          onChange={(e) => setTunelForm({ ...tunelForm, zunchoSeguridad: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <label htmlFor="zunchoSeguridadTab" className="text-xs font-semibold text-slate-600 cursor-pointer">
                          ¿Zuncho de Seguridad?
                        </label>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-slate-500 block">Fecha/Hora Ingreso & Salida</label>
                        <div className="flex gap-2">
                          <Input
                            type="datetime-local"
                            required
                            value={tunelForm.fechaHoraIngresoTunel}
                            onChange={(e) => setTunelForm({ ...tunelForm, fechaHoraIngresoTunel: e.target.value })}
                            className="text-xs p-1 h-8"
                          />
                          <Input
                            type="datetime-local"
                            required
                            value={tunelForm.fechaHoraSalidaTunel}
                            onChange={(e) => setTunelForm({ ...tunelForm, fechaHoraSalidaTunel: e.target.value })}
                            className="text-xs p-1 h-8"
                          />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold">
                      Registrar Salida de Túnel y Empaque
                    </Button>
                  </form>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    Solo rol PRODUCCION o ADMIN puede registrar salidas de túnel.
                  </p>
                )}
              </div>

              {/* SUB-FORM 2: CAMARA */}
              <div className="border p-5 rounded-xl space-y-4 bg-slate-50 shadow-inner">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b pb-2">
                  <Layers className="h-4 w-4 text-indigo-600" /> Paso 2: Control de Metales, Calidad y Almacenamiento
                </h3>
                {checkRole(['CALIDAD', 'QA', 'ADMIN']) ? (
                  <form onSubmit={submitCamara} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600">Lote en Congelamiento (Túnel Completo)</label>
                      <Select
                        value={camaraForm.loteOrigenId}
                        onChange={(e) => {
                          const id = parseInt(e.target.value) || 0
                          setCamaraForm({ ...camaraForm, loteOrigenId: id })
                        }}
                      >
                        <option value="0">Seleccionar lote...</option>
                        {congelamientos
                          .filter((c) => c.estado === 'EN_TUNEL' || c.estado === 'NO_APTO_RETENIDO' || c.estado === 'CUARENTENA')
                          .map((c) => (
                            <option key={c.id} value={c.loteOrigen.id}>
                              {c.loteOrigen.idLoteProduccion} (Túnel: {c.numeroEquipoFrio || c.numeroTunel} - Temp: {c.temperaturaCentroTermico} °C)
                            </option>
                          ))}
                      </Select>
                    </div>

                    {/* DETECTOR DE METALES */}
                    <div className="border p-3 rounded-lg bg-indigo-50/50 space-y-3">
                      <span className="text-xs font-extrabold text-indigo-950 flex items-center gap-1">
                        <Cpu className="h-3.5 w-3.5 text-indigo-700 animate-pulse" /> 1. Detector de Metales (Crítico FDA)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-600">Estado del Detector</label>
                          <Select
                            value={camaraForm.pasoDetectorMetales}
                            onChange={(e) => setCamaraForm({ ...camaraForm, pasoDetectorMetales: e.target.value })}
                          >
                            <option value="Conforme">Conforme (Cero Metales)</option>
                            <option value="Rechazado por Detección">Rechazado por Detección (Aislado)</option>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600">Prueba de Patrón (Fe/Non-Fe/SS)</label>
                          <Select
                            value={camaraForm.pruebaPatronDetector ? 'true' : 'false'}
                            onChange={(e) => setCamaraForm({ ...camaraForm, pruebaPatronDetector: e.target.value === 'true' })}
                          >
                            <option value="true">Superada (Funcionando)</option>
                            <option value="false">Falla (Parada y Mantenimiento)</option>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* CONTROLES DE LABORATORIO DIVERGENTES POR ESPECIE */}
                    <div className="border p-3 rounded-lg bg-amber-50/30 space-y-3">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                        🔬 2. Calidad de Laboratorio (FDA / UE)
                      </span>
                      {especieLote ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs border-b pb-1">
                            <span className="font-semibold text-slate-600">Especie Detectada:</span>
                            <Badge className="bg-slate-800 text-white font-bold">{especieLote}</Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {especieLote === 'PERICO' && (
                              <div>
                                <label className="text-xs font-semibold text-slate-600">Histamina (ppm)</label>
                                <Input
                                  type="number"
                                  required
                                  value={camaraForm.nivelHistaminaPpm ?? ''}
                                  onChange={(e) => setCamaraForm({ ...camaraForm, nivelHistaminaPpm: parseFloat(e.target.value) || 0 })}
                                  placeholder="Límite: <50 ppm"
                                />
                                <span className="text-[9px] text-slate-500">Rechazo FDA si Histamina &gt; 50 ppm</span>
                              </div>
                            )}

                            {especieLote === 'POTA' && (
                              <>
                                <div>
                                  <label className="text-xs font-semibold text-slate-600">TVB-N (mg/100g)</label>
                                  <Input
                                    type="number"
                                    required
                                    value={camaraForm.pruebaTvbn ?? ''}
                                    onChange={(e) => setCamaraForm({ ...camaraForm, pruebaTvbn: parseFloat(e.target.value) || 0 })}
                                    placeholder="Límite: <30 mg/100g"
                                  />
                                  <span className="text-[9px] text-slate-500">Rechazo FDA si TVB-N &gt; 30 mg/100g</span>
                                </div>
                                <div>
                                  <label className="text-xs font-semibold text-slate-600">Sabor Residual Ácido</label>
                                  <Select
                                    value={camaraForm.saborResidualAcido}
                                    onChange={(e) => setCamaraForm({ ...camaraForm, saborResidualAcido: e.target.value })}
                                  >
                                    <option value="Ausente">Ausente (Aprobado)</option>
                                    <option value="Presente">Presente (Rechazo)</option>
                                  </Select>
                                </div>
                              </>
                            )}

                            <div>
                              <label className="text-xs font-semibold text-slate-600">Análisis Microbiológico</label>
                              <Select
                                value={camaraForm.analisisMicrobiologico}
                                onChange={(e) => setCamaraForm({ ...camaraForm, analisisMicrobiologico: e.target.value })}
                              >
                                <option value="Conforme">Conforme</option>
                                <option value="En proceso">En proceso (Cuarentena)</option>
                                <option value="Contaminado">Contaminado (Rechazo)</option>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic py-1">Seleccione un lote para cargar los controles de laboratorio correspondientes.</p>
                      )}
                    </div>

                    {/* ALMACENAMIENTO Y LOGISTICA */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Cámara Destino</label>
                        <Input
                          required
                          value={camaraForm.camaraDestino}
                          onChange={(e) => setCamaraForm({ ...camaraForm, camaraDestino: e.target.value })}
                          placeholder="Cámara A/B..."
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Ubicación Rack / Fila</label>
                        <Input
                          required
                          value={camaraForm.ubicacionRack}
                          onChange={(e) => setCamaraForm({ ...camaraForm, ubicacionRack: e.target.value })}
                          placeholder="Ej: Fila 4, Rack 2"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Tipo de Pallet</label>
                        <Select
                          value={camaraForm.tipoPallet}
                          onChange={(e) => setCamaraForm({ ...camaraForm, tipoPallet: e.target.value })}
                        >
                          <option value="Madera Fumigada">Madera Fumigada</option>
                          <option value="Plástico Retornable">Plástico Retornable</option>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Inocuidad HACCP</label>
                        <Select
                          value={camaraForm.estadoInocuidadHACCP}
                          onChange={(e) => setCamaraForm({ ...camaraForm, estadoInocuidadHACCP: e.target.value as any })}
                        >
                          <option value="APTO">Apto</option>
                          <option value="RETENIDO">Retenido</option>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Estado de Liberación</label>
                        <Select
                          value={camaraForm.estadoLiberacionHaccp}
                          onChange={(e) => setCamaraForm({ ...camaraForm, estadoLiberacionHaccp: e.target.value })}
                        >
                          <option value="LIBERADO">LIBERADO</option>
                          <option value="RETENIDO">RETENIDO</option>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600">Fecha Prog. Despacho</label>
                        <Input
                          type="date"
                          required
                          value={camaraForm.fechaProgramadaDespacho}
                          onChange={(e) => setCamaraForm({ ...camaraForm, fechaProgramadaDespacho: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600">Fecha/Hora Ingreso Cámara</label>
                      <Input
                        type="datetime-local"
                        required
                        value={camaraForm.fechaHoraIngresoCamara}
                        onChange={(e) => setCamaraForm({ ...camaraForm, fechaHoraIngresoCamara: e.target.value })}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-slate-850 hover:bg-slate-900 text-white font-semibold flex items-center justify-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" /> Registrar Ingreso a Cámara & Liberar
                    </Button>
                  </form>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    Solo rol CALIDAD, QA o ADMIN puede registrar ingresos a cámara de almacenamiento y calidad.
                  </p>
                )}
              </div>
            </div>

            <h3 className="font-bold text-slate-800 text-sm mt-6">Monitoreo de Lotes en Cadena de Frío, Calidad y Metales</h3>
            <div className="border rounded-xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="font-semibold text-slate-700 text-xs">Lote / Especie</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">Congelamiento</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">Empaques & Cajas</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">Metales 🧲</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">Laboratorio 🔬</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">Ubicación</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs">Vencimiento (+18m)</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-xs text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {congelamientos.map((c) => {
                    const especie = c.loteOrigen?.loteOrigen?.loteOrigen?.especie
                    return (
                      <TableRow key={c.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-indigo-950">{c.loteOrigen.idLoteProduccion}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">{especie}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            <span className="font-medium text-slate-700">{c.metodoCongelamiento || 'En Túnel'}</span>
                            <span className="text-[10px] text-slate-500">Equipo: {c.numeroEquipoFrio || c.numeroTunel}</span>
                            <span className="font-extrabold text-slate-900 mt-0.5">Temp: {c.temperaturaCentroTermico} °C</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col text-xs text-slate-700">
                            {c.cantidadCajasFinales ? (
                              <>
                                <span className="font-bold text-indigo-950">{c.cantidadCajasFinales} Cajas</span>
                                <span className="text-[10px] text-slate-500">Neto: {c.pesoNetoDeclarado} kg / caja</span>
                                <span className="text-[10px] text-slate-500">Glaseado: {c.porcentajeGlaseado}%</span>
                                {c.zunchoSeguridad && <Badge className="w-fit bg-emerald-50 text-emerald-800 font-semibold px-1 py-0.5 text-[9px] mt-0.5">Con Zuncho</Badge>}
                              </>
                            ) : (
                              <span className="text-slate-400 italic">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{renderMetalesCell(c)}</TableCell>
                        <TableCell>{renderLaboratorioCell(c)}</TableCell>
                        <TableCell>{renderUbicacionCell(c)}</TableCell>
                        <TableCell className="text-xs text-slate-700 font-semibold">{c.fechaVencimiento || '—'}</TableCell>
                        <TableCell className="text-right">{getEstadoBadge(c.estado)}</TableCell>
                      </TableRow>
                    )
                  })}
                  {congelamientos.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                        No hay lotes en congelamiento registrados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* PANEL 5: DESPACHO */}
        {activeTab === 'despacho' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <Truck className="text-indigo-600 h-5 w-5" /> Despacho y Exportación (SANIPES)
            </h2>
            {checkRole(['LOGISTICA', 'ADMIN']) ? (
              <form onSubmit={submitDespacho} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Seleccionar Lote de Cámara (FIFO)</label>
                  <Select
                    value={formDespacho.loteId}
                    onChange={(e) => setFormDespacho({ ...formDespacho, loteId: parseInt(e.target.value) || 0 })}
                  >
                    <option value="0">Seleccionar lote listo...</option>
                    {disponiblesDespacho.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.loteOrigen.idLoteProduccion} (Cámara: {c.camaraDestino} - Peso: {c.loteOrigen.pesoNetoFinal} kg)
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">RUC del Cliente</label>
                  <div className="relative">
                    <Input
                      required
                      maxLength={11}
                      value={formDespacho.rucCliente}
                      onChange={(e) => setFormDespacho({ ...formDespacho, rucCliente: e.target.value })}
                      placeholder="Ej: 20512345678"
                    />
                    {buscandoRuc && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {errorRuc && <p className="text-[10px] text-red-600 mt-1 leading-snug">{errorRuc}</p>}
                </div>

                {/* Razón Social: Hidden/Disabled by default, shown/editable only if lookup fails */}
                {showRazonSocialManual ? (
                  <div className="bg-red-50 border border-red-200 p-2 rounded-lg col-span-1">
                    <label className="text-xs font-bold text-red-800">Razón Social</label>
                    <Input
                      required
                      value={formDespacho.razonSocialCliente}
                      onChange={(e) => setFormDespacho({ ...formDespacho, razonSocialCliente: e.target.value })}
                      placeholder="Ingrese Razón Social manualmente"
                      className="border-red-300 focus:border-red-500 mt-0.5"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-slate-500">Razón Social Cliente</label>
                    <Input
                      disabled
                      value={formDespacho.razonSocialCliente}
                      placeholder="Se autocompleta con el RUC..."
                      className="bg-slate-200 border-slate-300 text-slate-600"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-600">Puerto de Destino</label>
                  <Input
                    required
                    value={formDespacho.puertoDestino}
                    onChange={(e) => setFormDespacho({ ...formDespacho, puertoDestino: e.target.value })}
                    placeholder="Ej: Puerto de Shanghái"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Reserva Naviera (Booking)</label>
                  <Input
                    required
                    value={formDespacho.reservaNaviera}
                    onChange={(e) => setFormDespacho({ ...formDespacho, reservaNaviera: e.target.value })}
                    placeholder="Ej: BKG-SH-99635"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">N° Contenedor Frigorífico</label>
                  <Input
                    required
                    value={formDespacho.numeroContenedorFrigorifico}
                    onChange={(e) => setFormDespacho({ ...formDespacho, numeroContenedorFrigorifico: e.target.value })}
                    placeholder="Ej: MSKU-886932-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Precintos Naviera/Aduanas</label>
                  <Input
                    required
                    value={formDespacho.precintosAduanerosNavieros}
                    onChange={(e) => setFormDespacho({ ...formDespacho, precintosAduanerosNavieros: e.target.value })}
                    placeholder="Ej: AD-96532 / MSK-4458"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Temp. Seteo Contenedor (°C)</label>
                  <Input
                    type="number"
                    step="0.1"
                    required
                    value={formDespacho.temperaturaSeteoContenedor || ''}
                    onChange={(e) => setFormDespacho({ ...formDespacho, temperaturaSeteoContenedor: parseFloat(e.target.value) || 0 })}
                    placeholder="Ej: -20.0"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Número DUS</label>
                  <Input
                    required
                    value={formDespacho.numeroDUS}
                    onChange={(e) => setFormDespacho({ ...formDespacho, numeroDUS: e.target.value })}
                    placeholder="Ej: 118-2026-035412"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Certificado Sanitario SANIPES</label>
                  <Input
                    required
                    value={formDespacho.codigoCertificadoSanitario}
                    onChange={(e) => setFormDespacho({ ...formDespacho, codigoCertificadoSanitario: e.target.value })}
                    placeholder="Ej: SANIPES-00352-26"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Estado Despacho</label>
                  <Select
                    value={formDespacho.estado}
                    onChange={(e) => setFormDespacho({ ...formDespacho, estado: e.target.value as any })}
                  >
                    <option value="DESPACHADO_EN_TRANSITO">Despachado / Tránsito Marítimo</option>
                    <option value="STOCK_DISPONIBLE">Stock Disponible (Conservar en Cámara)</option>
                  </Select>
                </div>
                <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                  <Button type="submit" className="bg-indigo-950 text-white font-semibold">
                    <Truck className="h-4 w-4 mr-1.5" /> Registrar Despacho de Exportación
                  </Button>
                </div>
              </form>
            ) : (
              <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <div>
                  <strong>Acceso Restringido:</strong> Solo usuarios con rol <strong>LOGISTICA</strong> o <strong>ADMIN</strong> pueden registrar despachos de exportación.
                </div>
              </div>
            )}
          </div>
        )}

        {/* PANEL 6: AUDITORIA / LISTADO TRAZABILIDAD */}
        {activeTab === 'auditoria' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
              <FileText className="text-indigo-600 h-5 w-5" /> Centro de Auditoría de Trazabilidad
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Consulte el historial de trazabilidad end-to-end de los lotes y descargue los documentos reglamentarios oficiales (Packing List Comercial y Guía de Remisión Remitente).
            </p>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lote ID</TableHead>
                  <TableHead>Lote Producción</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>Peso Neto</TableHead>
                  <TableHead>Cámara</TableHead>
                  <TableHead>Estado Lote</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {congelamientos.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold text-indigo-950"># {c.id}</TableCell>
                    <TableCell className="font-bold text-xs">{c.loteOrigen.idLoteProduccion}</TableCell>
                    <TableCell>{c.loteOrigen.loteOrigen.loteOrigen.especie}</TableCell>
                    <TableCell>{c.loteOrigen.pesoNetoFinal} kg</TableCell>
                    <TableCell>{c.camaraDestino || '—'}</TableCell>
                    <TableCell>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: `${c.colorHex}20`, color: c.colorHex }}
                      >
                        {formatEstado(c.estado)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => verTimeline(c.id)}>
                          <Eye className="h-4 w-4 mr-1 text-indigo-600" /> Timeline
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

      </div>

      {/* TIMELINE MODAL */}
      {verTimelineModal && trazabilidad && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setVerTimelineModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-cyan-400" />
                <div>
                  <h2 className="text-lg font-bold">Línea de Tiempo de Trazabilidad</h2>
                  <span className="text-xs text-slate-300 font-mono">
                    Lote de Producción: {trazabilidad.procesamiento?.idLoteProduccion || 'No generado'}
                  </span>
                </div>
              </div>
              <Button variant="ghost" className="text-white hover:bg-white/10" size="sm" onClick={() => setVerTimelineModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Timeline Body */}
            <div className="p-8 space-y-8">

              <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">

                {/* STAGE 1: RECEPCION */}
                <div className="relative pl-8">
                  <div className="absolute -left-[11px] top-1.5 bg-indigo-900 text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                    1
                  </div>
                  <div className="border rounded-xl p-4 shadow-xs bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <Anchor className="h-4 w-4 text-indigo-700" /> Recepción en Muelle (Ticket #{trazabilidad.recepcion.idTicket})
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">
                        {trazabilidad.recepcion.fechaHoraIngreso ? new Date(trazabilidad.recepcion.fechaHoraIngreso).toLocaleString() : ''}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600">
                      <span><strong>DER:</strong> {trazabilidad.recepcion.numeroDER}</span>
                      <span><strong>Embarcación:</strong> {trazabilidad.recepcion.nombreEmbarcacion}</span>
                      <span><strong>Especie:</strong> {trazabilidad.recepcion.especie}</span>
                      <span><strong>Peso Bruto:</strong> {trazabilidad.recepcion.pesoBrutoBascula} kg</span>
                      <span><strong>Temp Llegada:</strong> {trazabilidad.recepcion.temperaturaLlegada} °C</span>
                      <span><strong>Turno:</strong> {trazabilidad.recepcion.turno}</span>
                      <span className="col-span-2"><strong>Responsable Muelle:</strong> {trazabilidad.recepcion.nombreResponsable}</span>
                    </div>
                  </div>
                </div>

                {/* STAGE 2: CLASIFICACION */}
                <div className="relative pl-8">
                  <div className="absolute -left-[11px] top-1.5 bg-indigo-900 text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                    2
                  </div>
                  {trazabilidad.clasificacion ? (
                    <div className="border rounded-xl p-4 shadow-xs bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <Clipboard className="h-4 w-4 text-indigo-700" /> Clasificación y Calidad
                        </h4>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: `${trazabilidad.clasificacion.colorHex}20`, color: trazabilidad.clasificacion.colorHex }}
                        >
                          {formatEstado(trazabilidad.clasificacion.estado)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600">
                        <span><strong>Sensorial:</strong> {trazabilidad.clasificacion.evaluacionSensorial}</span>
                        <span><strong>Talla:</strong> {trazabilidad.clasificacion.calibreTalla}</span>
                        <span><strong>Merma/Descarte:</strong> {trazabilidad.clasificacion.mermaTotal} kg</span>
                        <span className="text-green-700 font-bold"><strong>Peso Útil:</strong> {trazabilidad.clasificacion.pesoUtil} kg</span>
                        <span><strong>Inspector QA:</strong> {trazabilidad.clasificacion.nombreInspectorQA}</span>
                        <span className="col-span-3"><strong>Firma Digital:</strong> {trazabilidad.clasificacion.firmaQA}</span>
                        {trazabilidad.clasificacion.motivoRechazo && (
                          <span className="col-span-4 text-red-600 font-semibold bg-red-50 p-2 rounded">
                            Motivo Rechazo: {trazabilidad.clasificacion.motivoRechazo}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-xl p-4 text-slate-400 text-xs italic flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-300" /> Clasificación pendiente de registro...
                    </div>
                  )}
                </div>

                {/* STAGE 3: PROCESAMIENTO */}
                <div className="relative pl-8">
                  <div className="absolute -left-[11px] top-1.5 bg-indigo-900 text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                    3
                  </div>
                  {trazabilidad.procesamiento ? (
                    <div className="border rounded-xl p-4 shadow-xs bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <Layers className="h-4 w-4 text-indigo-700" /> Sala de Cortes / Producción
                        </h4>
                        <span className="text-xs text-slate-600 font-bold bg-slate-200 px-2 py-0.5 rounded">
                          Rendimiento: {trazabilidad.procesamiento.porcentajeRendimiento} %
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600">
                        <span><strong>Lote Producción:</strong> {trazabilidad.procesamiento.idLoteProduccion}</span>
                        <span><strong>Tipo Corte:</strong> {trazabilidad.procesamiento.tipoCorte}</span>
                        <span><strong>Tratamiento:</strong> {trazabilidad.procesamiento.tratamientoQuimico}</span>
                        <span><strong>Empaque:</strong> {trazabilidad.procesamiento.tipoEmpaque}</span>
                        <span><strong>Bultos/Cajas:</strong> {trazabilidad.procesamiento.cantidadBultosCajas}</span>
                        <span><strong>Peso Neto Final:</strong> {trazabilidad.procesamiento.pesoNetoFinal} kg</span>
                        <span className="col-span-2"><strong>Supervisor:</strong> {trazabilidad.procesamiento.nombreSupervisor}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-xl p-4 text-slate-400 text-xs italic flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-300" /> Sala de cortes pendiente de registro...
                    </div>
                  )}
                </div>

                {/* STAGE 4: CONGELAMIENTO */}
                <div className="relative pl-8">
                  <div className="absolute -left-[11px] top-1.5 bg-indigo-900 text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                    4
                  </div>
                  {trazabilidad.congelamiento ? (
                    <div className="border rounded-xl p-4 shadow-xs bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <Snowflake className="h-4 w-4 text-indigo-700" /> Almacenamiento & Congelación
                        </h4>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: `${trazabilidad.congelamiento.colorHex}20`, color: trazabilidad.congelamiento.colorHex }}
                        >
                          {formatEstado(trazabilidad.congelamiento.estado)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs text-slate-650 text-slate-600 bg-slate-100/55 p-3 rounded-lg border border-slate-200/50">
                        <span><strong>Método Cong.:</strong> {trazabilidad.congelamiento.metodoCongelamiento || 'Túnel de Placas'}</span>
                        <span><strong>Equipo de Frío:</strong> {trazabilidad.congelamiento.numeroEquipoFrio || trazabilidad.congelamiento.numeroTunel}</span>
                        <span className="font-bold text-indigo-900"><strong>Temp Túnel:</strong> {trazabilidad.congelamiento.temperaturaCentroTermico} °C</span>
                        <span><strong>Glaseado:</strong> {trazabilidad.congelamiento.porcentajeGlaseado || 0} %</span>
                        
                        <span><strong>Empaque 1°:</strong> {trazabilidad.congelamiento.tipoEmpaquePrimario || '—'}</span>
                        <span><strong>Empaque 2°:</strong> {trazabilidad.congelamiento.tipoEmpaqueSecundario || '—'}</span>
                        <span><strong>Peso Bruto Caja:</strong> {trazabilidad.congelamiento.pesoBrutoCaja || 0} kg</span>
                        <span><strong>Peso Neto Caja:</strong> {trazabilidad.congelamiento.pesoNetoDeclarado || 0} kg</span>
                        <span><strong>Cajas Producidas:</strong> {trazabilidad.congelamiento.cantidadCajasFinales || 0} cajas</span>
                        <span><strong>Zuncho Seguridad:</strong> {trazabilidad.congelamiento.zunchoSeguridad ? 'SÍ (Instalado)' : 'NO'}</span>
                        
                        <span><strong>Detector Metales:</strong> {trazabilidad.congelamiento.pasoDetectorMetales || 'Pendiente'}</span>
                        <span><strong>Prueba Patrón:</strong> {trazabilidad.congelamiento.pruebaPatronDetector ? 'Superada' : 'Falla'}</span>
                        <span><strong>Operario Detec.:</strong> {trazabilidad.congelamiento.operarioDetector || '—'}</span>
                        <span><strong>Microbiología:</strong> {trazabilidad.congelamiento.analisisMicrobiologico || 'En Proceso'}</span>
                        
                        {trazabilidad.recepcion.especie === 'PERICO' && (
                          <span className={Number(trazabilidad.congelamiento.nivelHistaminaPpm) > 50 ? 'text-red-500 font-bold bg-red-50 px-1 rounded' : 'text-green-600 font-bold bg-green-50 px-1 rounded'}>
                            <strong>Histamina:</strong> {trazabilidad.congelamiento.nivelHistaminaPpm !== undefined ? `${trazabilidad.congelamiento.nivelHistaminaPpm} ppm` : 'Pendiente'}
                          </span>
                        )}
                        {trazabilidad.recepcion.especie === 'POTA' && (
                          <>
                            <span className={Number(trazabilidad.congelamiento.pruebaTvbn) > 30 ? 'text-red-500 font-bold bg-red-50 px-1 rounded' : 'text-green-600 font-bold bg-green-50 px-1 rounded'}>
                              <strong>TVB-N:</strong> {trazabilidad.congelamiento.pruebaTvbn !== undefined ? `${trazabilidad.congelamiento.pruebaTvbn} mg/100g` : 'Pendiente'}
                            </span>
                            <span><strong>Sabor Residual:</strong> {trazabilidad.congelamiento.saborResidualAcido || 'Ausente'}</span>
                          </>
                        )}
                        
                        <span><strong>Cámara Destino:</strong> {trazabilidad.congelamiento.camaraDestino || 'Pendiente'}</span>
                        <span><strong>Ubicación Rack:</strong> {trazabilidad.congelamiento.ubicacionRack || '—'}</span>
                        <span><strong>Tipo Pallet:</strong> {trazabilidad.congelamiento.tipoPallet || '—'}</span>
                        <span><strong>Liberación HACCP:</strong> {trazabilidad.congelamiento.estadoLiberacionHaccp || 'Pendiente'}</span>
                        <span><strong>Ingreso Cámara:</strong> {trazabilidad.congelamiento.fechaHoraIngresoCamara ? new Date(trazabilidad.congelamiento.fechaHoraIngresoCamara).toLocaleString() : '—'}</span>
                        <span className="text-red-700 font-bold"><strong>Vencimiento (18m):</strong> {trazabilidad.congelamiento.fechaVencimiento || '—'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-xl p-4 text-slate-400 text-xs italic flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-300" /> Congelamiento / Cámara pendiente...
                    </div>
                  )}
                </div>

                {/* STAGE 5: DESPACHO */}
                <div className="relative pl-8">
                  <div className="absolute -left-[11px] top-1.5 bg-indigo-900 text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                    5
                  </div>
                  {trazabilidad.despacho ? (
                    <div className="border rounded-xl p-4 shadow-xs bg-slate-50 space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          <Truck className="h-4 w-4 text-indigo-700" /> Despacho Comercial de Exportación (SANIPES)
                        </h4>
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: `${trazabilidad.despacho.colorHex}20`, color: trazabilidad.despacho.colorHex }}
                        >
                          {formatEstado(trazabilidad.despacho.estado)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600">
                        <span><strong>RUC Cliente:</strong> {trazabilidad.despacho.rucCliente}</span>
                        <span className="col-span-3"><strong>Cliente Razón Social:</strong> {trazabilidad.despacho.razonSocialCliente}</span>
                        <span><strong>Puerto Destino:</strong> {trazabilidad.despacho.puertoDestino}</span>
                        <span><strong>Naviera (Booking):</strong> {trazabilidad.despacho.reservaNaviera}</span>
                        <span><strong>N° Contenedor:</strong> {trazabilidad.despacho.numeroContenedorFrigorifico}</span>
                        <span><strong>Precintos:</strong> {trazabilidad.despacho.precintosAduanerosNavieros}</span>
                        <span><strong>Temp Contenedor:</strong> {trazabilidad.despacho.temperaturaSeteoContenedor} °C</span>
                        <span><strong>Número DUS:</strong> {trazabilidad.despacho.numeroDUS}</span>
                        <span className="font-semibold text-green-800"><strong>SANIPES Cert.:</strong> {trazabilidad.despacho.codigoCertificadoSanitario}</span>
                        <span><strong>Despachador:</strong> {trazabilidad.despacho.nombreDespachador}</span>
                      </div>

                      {/* PDF Documents download buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          size="sm"
                          className="bg-indigo-950 hover:bg-slate-900 text-white font-semibold flex items-center justify-center gap-1.5"
                          onClick={() => downloadPDF(trazabilidad.despacho!.id, 'packing-list')}
                        >
                          <Download className="h-4 w-4" /> Packing List PDF
                        </Button>
                        <Button
                          size="sm"
                          className="bg-teal-750 bg-teal-800 hover:bg-teal-900 text-white font-semibold flex items-center justify-center gap-1.5"
                          onClick={() => downloadPDF(trazabilidad.despacho!.id, 'guia-remision')}
                        >
                          <Download className="h-4 w-4" /> Guía Remisión PDF
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed rounded-xl p-4 text-slate-400 text-xs italic flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-300" /> Lote aún no despachado / en tránsito.
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-slate-50 flex justify-end">
              <Button onClick={() => setVerTimelineModal(false)} className="bg-slate-800 text-white font-semibold">
                Cerrar Línea de Tiempo
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
