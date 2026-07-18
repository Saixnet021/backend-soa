'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getProcesamientos, getCongelamientos, registrarTunel, registrarCamara, ProcesamientoResponse, CongelamientoResponse } from '@/lib/api/trazabilidad'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Snowflake, Thermometer, Layers, ShieldCheck, ShieldAlert, Cpu } from 'lucide-react'
import { formatEstado } from '@/lib/utils'

export default function CongelamientoPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const checkRole = (roles: string[]) => usuario && roles.includes(usuario.rol)

  const [procesamientos, setProcesamientos] = useState<ProcesamientoResponse[]>([])
  const [congelamientos, setCongelamientos] = useState<CongelamientoResponse[]>([])
  const [loading, setLoading] = useState(true)

  // Sub-formulario Tunel
  const [tunelForm, setTunelForm] = useState({
    loteOrigenId: 0,
    numeroTunel: '',
    fechaHoraIngresoTunel: new Date().toISOString().slice(0, 16),
    fechaHoraSalidaTunel: new Date().toISOString().slice(0, 16),
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

  // Sub-formulario Camara
  const [camaraForm, setCamaraForm] = useState({
    loteOrigenId: 0,
    camaraDestino: '',
    fechaHoraIngresoCamara: new Date().toISOString().slice(0, 16),
    fechaProgramadaDespacho: new Date().toISOString().slice(0, 10),
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

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [procs, congs] = await Promise.all([
        getProcesamientos(),
        getCongelamientos()
      ])
      setProcesamientos(procs)
      setCongelamientos(congs)
    } catch (err: any) {
      toast.error('Error al cargar datos de congelamiento')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const selectedCongelamiento = congelamientos.find((c) => c.loteOrigen.id === camaraForm.loteOrigenId)
  const especieLote = selectedCongelamiento?.loteOrigen?.loteOrigen?.loteOrigen?.especie

  const submitTunel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (tunelForm.loteOrigenId === 0) {
      toast.warning('Debe seleccionar un lote procesado de origen')
      return
    }
    try {
      await registrarTunel({
        ...tunelForm,
        numeroTunel: tunelForm.numeroEquipoFrio // Sync with numeroTunel field in legacy backend db
      })
      toast.success('Salida de túnel registrada exitosamente')
      cargarDatos()
      setTunelForm({
        loteOrigenId: 0,
        numeroTunel: '',
        fechaHoraIngresoTunel: new Date().toISOString().slice(0, 16),
        fechaHoraSalidaTunel: new Date().toISOString().slice(0, 16),
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
      toast.error(err.response?.data?.message || 'Error al registrar túnel')
    }
  }

  const submitCamara = async (e: React.FormEvent) => {
    e.preventDefault()
    if (camaraForm.loteOrigenId === 0) {
      toast.warning('Debe seleccionar un lote en congelamiento')
      return
    }
    try {
      await registrarCamara({
        ...camaraForm,
        operarioDetector: usuario?.username || ''
      })
      toast.success('Ingreso a cámara registrado exitosamente')
      cargarDatos()
      setCamaraForm({
        loteOrigenId: 0,
        camaraDestino: '',
        fechaHoraIngresoCamara: new Date().toISOString().slice(0, 16),
        fechaProgramadaDespacho: new Date().toISOString().slice(0, 10),
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
      toast.error(err.response?.data?.message || 'Error al registrar cámara')
    }
  }

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

  if (loading) return <Skeleton className="h-96 rounded-lg animate-pulse" />

  return (
    <div className="space-y-6 bg-white border rounded-2xl shadow-sm p-6">
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
                      id="zunchoSeguridad"
                      checked={tunelForm.zunchoSeguridad}
                      onChange={(e) => setTunelForm({ ...tunelForm, zunchoSeguridad: e.target.checked })}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <label htmlFor="zunchoSeguridad" className="text-xs font-semibold text-slate-600 cursor-pointer">
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
    </div>
  )
}
