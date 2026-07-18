'use client'

import { useState, useEffect } from 'react'
import { getCongelamientos, getTrazabilidadCompleta, TrazabilidadCompleta, CongelamientoResponse } from '@/lib/api/trazabilidad'
import { formatEstado } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  FileText,
  Eye,
  Download,
  X,
  Activity,
  Anchor,
  Clipboard,
  Layers,
  Snowflake,
  Truck,
  Clock,
  Search
} from 'lucide-react'

export default function AuditoriaPage() {
  const [congelamientos, setCongelamientos] = useState<CongelamientoResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Modals & Timelines
  const [selectedLoteId, setSelectedLoteId] = useState<number | null>(null)
  const [trazabilidad, setTrazabilidad] = useState<TrazabilidadCompleta | null>(null)
  const [verTimelineModal, setVerTimelineModal] = useState(false)

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const congs = await getCongelamientos()
      setCongelamientos(congs)
    } catch (err: any) {
      toast.error('Error al cargar lotes para auditoría')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

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

  const filteredCongelamientos = congelamientos.filter((c) => {
    const query = searchQuery.toLowerCase()
    return (
      c.loteOrigen.idLoteProduccion.toLowerCase().includes(query) ||
      c.loteOrigen.loteOrigen.loteOrigen.especie.toLowerCase().includes(query) ||
      (c.camaraDestino && c.camaraDestino.toLowerCase().includes(query)) ||
      c.estado.toLowerCase().includes(query)
    );
  })

  if (loading) return <Skeleton className="h-96 rounded-lg animate-pulse" />

  return (
    <div className="space-y-6 bg-white border rounded-2xl shadow-sm p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <FileText className="text-indigo-600 h-5 w-5" /> Centro de Auditoría de Trazabilidad
        </h2>
        <p className="text-slate-600 text-sm leading-relaxed">
          Consulte el historial de trazabilidad end-to-end de los lotes y descargue los documentos reglamentarios oficiales (Packing List Comercial y Guía de Remisión Remitente).
        </p>

        {/* Search Bar */}
        <div className="flex max-w-md items-center gap-2 border bg-slate-50 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-600">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por lote de producción, especie, estado o cámara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-0 outline-none text-sm w-full text-slate-700"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

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
            {filteredCongelamientos.map((c) => (
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
                    <Button variant="outline" size="sm" onClick={() => verTimeline(c.id)}>
                      <Eye className="h-4 w-4 mr-1 text-indigo-600" /> Timeline
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredCongelamientos.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                  No se encontraron lotes para el criterio de búsqueda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs text-slate-600 bg-slate-100/55 p-3 rounded-lg border border-slate-200/50">
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
                          className="bg-teal-850 bg-teal-800 hover:bg-teal-900 text-white font-semibold flex items-center justify-center gap-1.5"
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
