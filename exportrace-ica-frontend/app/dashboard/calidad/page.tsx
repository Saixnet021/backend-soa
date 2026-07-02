'use client'
import { useState, useEffect, useRef } from 'react'
import { getTemperaturasPorLote, registrarTemperatura } from '@/lib/api/calidad'
import { getLotes } from '@/lib/api/lotes'
import type { AuditoriaCalidad, LotePesca } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Thermometer, Search, AlertTriangle, CheckCircle2, X, QrCode, Camera, Ship } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { toast } from 'sonner'

export default function CalidadPage() {
  const [idLote, setIdLote] = useState('')
  const [data, setData] = useState<AuditoriaCalidad[]>([])
  const [loading, setLoading] = useState(false)
  const [cargandoInicial, setCargandoInicial] = useState(true)

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [lotes, setLotes] = useState<LotePesca[]>([])
  const [formLoteId, setFormLoteId] = useState('')
  const [formCamara, setFormCamara] = useState('')
  const [formTemp, setFormTemp] = useState('')
  const [formInspector, setFormInspector] = useState('2')
  const [formObs, setFormObs] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Scanner
  const [showScanner, setShowScanner] = useState(false)
  const [filtroLote, setFiltroLote] = useState('')
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Cargar todas las temperaturas al entrar
  useEffect(() => {
    cargarTodas()
  }, [])

  const cargarTodas = async () => {
    setCargandoInicial(true)
    try {
      const lotesData = await getLotes().catch(() => [])
      const allTemps: AuditoriaCalidad[] = []
      for (const lote of lotesData) {
        try {
          const temps = await getTemperaturasPorLote(lote.id)
          if (temps && temps.length > 0) allTemps.push(...temps)
        } catch {}
      }
      setData(allTemps.sort((a, b) => new Date(b.timestampMedicion).getTime() - new Date(a.timestampMedicion).getTime()))
    } catch {
      setData([])
    } finally {
      setCargandoInicial(false)
    }
  }

  const buscar = async () => {
    if (!idLote) {
      cargarTodas()
      return
    }
    setLoading(true)
    try {
      const temps = await getTemperaturasPorLote(Number(idLote))
      setData(temps || [])
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  // Abrir modal
  const abrirModal = async () => {
    try {
      const lotesData = await getLotes()
      setLotes(lotesData || [])
    } catch {
      setLotes([])
    }
    setFormLoteId('')
    setFormCamara('')
    setFormTemp('')
    setFormInspector('2')
    setFormObs('')
    setShowModal(true)
  }

  // Cerrar modal y cámara
  const cerrarModal = () => {
    setShowModal(false)
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop())
      setCameraStream(null)
    }
    setShowScanner(false)
  }

  // Abrir escáner
  const abrirScanner = async () => {
    setShowScanner(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      setCameraStream(stream)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      }, 300)
    } catch {
      toast.error('No se pudo acceder a la cámara')
    }
  }

  const cerrarScanner = () => {
    setShowScanner(false)
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop())
      setCameraStream(null)
    }
  }

  const seleccionarLote = (lote: LotePesca) => {
    setFormLoteId(String(lote.id))
    cerrarScanner()
    toast.success(`Lote ${lote.codigoLote} seleccionado`)
  }

  // Submit
  const submitTemperatura = async () => {
    if (!formLoteId || !formCamara || !formTemp) {
      toast.warning('Completa lote, cámara y temperatura')
      return
    }
    setSubmitting(true)
    try {
      await registrarTemperatura({
        idLote: Number(formLoteId),
        idInspector: Number(formInspector),
        temperaturaCelsius: Number(formTemp),
        idCamara: formCamara,
        observaciones: formObs,
        timestampMedicion: new Date().toISOString().replace('Z', ''),
      })
      toast.success('Temperatura registrada')
      cerrarModal()
      // Refrescar datos
      if (idLote) {
        const temps = await getTemperaturasPorLote(Number(idLote))
        setData(temps || [])
      } else {
        cargarTodas()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar')
    } finally {
      setSubmitting(false)
    }
  }

  const lotesFiltrados = lotes.filter(l =>
    l.codigoLote.toLowerCase().includes(filtroLote.toLowerCase()) ||
    l.especie.toLowerCase().includes(filtroLote.toLowerCase()) ||
    l.nombreEmbarcacion.toLowerCase().includes(filtroLote.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex gap-2">
          <Input
            value={idLote}
            onChange={e => setIdLote(e.target.value)}
            placeholder="ID de Lote..."
            type="number"
            className="w-40"
            onKeyDown={e => e.key === 'Enter' && buscar()}
          />
          <Button onClick={buscar} disabled={loading}>
            <Search className="h-4 w-4 mr-1" />
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
        <Button onClick={abrirModal}>
          <Plus className="h-4 w-4 mr-1" /> Registrar Temperatura
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lote</TableHead>
            <TableHead>Cámara</TableHead>
            <TableHead>Temperatura</TableHead>
            <TableHead>Inspector</TableHead>
            <TableHead>Fecha/Hora</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(t => {
            const fuera = t.temperaturaCelsius < -20 || t.temperaturaCelsius > -14
            return (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.idLote}</TableCell>
                <TableCell>{t.idCamara}</TableCell>
                <TableCell className={fuera ? 'text-red-600 font-bold' : 'text-green-600'}>
                  {t.temperaturaCelsius}°C
                </TableCell>
                <TableCell>{t.idInspector}</TableCell>
                <TableCell>{formatDateTime(t.timestampMedicion)}</TableCell>
                <TableCell>
                  {fuera ? (
                    <span className="flex items-center gap-1 text-red-600 text-xs">
                      <AlertTriangle className="h-3 w-3" /> Alerta
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle2 className="h-3 w-3" /> OK
                    </span>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
          {data.length === 0 && !loading && !cargandoInicial && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                <Thermometer className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No hay temperaturas registradas
              </TableCell>
            </TableRow>
          )}
          {(loading || cargandoInicial) && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* MODAL REGISTRAR TEMPERATURA */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={cerrarModal}>
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-indigo-600" />
                Registrar Temperatura
              </CardTitle>
              <button onClick={cerrarModal} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Lote de Pescado</label>
                <div className="flex gap-2">
                  <Select value={formLoteId} onChange={e => setFormLoteId(e.target.value)} className="flex-1">
                    <option value="">Seleccionar lote...</option>
                    {lotes.map(l => (
                      <option key={l.id} value={l.id}>{l.codigoLote} - {l.especie} - {l.nombreEmbarcacion}</option>
                    ))}
                  </Select>
                  <Button type="button" onClick={abrirScanner} className="bg-indigo-600 hover:bg-indigo-700 shrink-0">
                    <QrCode className="h-4 w-4 mr-1" /> QR
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Cámara o Túnel</label>
                <Select value={formCamara} onChange={e => setFormCamara(e.target.value)}>
                  <option value="">Seleccionar cámara...</option>
                  <option value="CAMARA-01">CAMARA-01</option>
                  <option value="CAMARA-02">CAMARA-02</option>
                  <option value="TUNEL-01">TUNEL-01</option>
                  <option value="TUNEL-02">TUNEL-02</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Temperatura (°C)</label>
                <Input type="number" step="0.1" value={formTemp} onChange={e => setFormTemp(e.target.value)} placeholder="-18.5" />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">ID Inspector</label>
                <Input type="number" value={formInspector} onChange={e => setFormInspector(e.target.value)} />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Observaciones</label>
                <Textarea value={formObs} onChange={e => setFormObs(e.target.value)} placeholder="Notas opcionales" />
              </div>

              <Button className="w-full" onClick={submitTemperatura} disabled={submitting}>
                {submitting ? 'Registrando...' : 'Registrar Temperatura'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ESCÁNER QR */}
      {showScanner && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={cerrarScanner}>
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-3 bg-slate-50 border-b">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-slate-600" />
                <span className="font-bold text-sm">Lector de Códigos QR</span>
              </div>
              <button onClick={cerrarScanner} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative h-56 bg-slate-950 flex items-center justify-center overflow-hidden">
              {cameraStream ? (
                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="text-center px-8">
                  <QrCode className="h-16 w-16 text-slate-600 mx-auto mb-3 animate-pulse" />
                  <p className="text-xs text-slate-400">Solicitando cámara...</p>
                </div>
              )}
              {/* Esquinas */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-indigo-500"></div>
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-indigo-500"></div>
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-indigo-500"></div>
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-indigo-500"></div>
              {/* Láser */}
              <div className="absolute w-[80%] h-0.5 bg-red-500 left-[10%] animate-pulse"></div>
              {cameraStream && (
                <div className="absolute bottom-2 left-2 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  CÁMARA ACTIVA
                </div>
              )}
            </div>

            <div className="p-3 border-t">
              <Input
                value={filtroLote}
                onChange={e => setFiltroLote(e.target.value)}
                placeholder="Buscar lote por código o barco..."
                className="mb-2"
              />
              <div className="max-h-40 overflow-y-auto space-y-1">
                {lotesFiltrados.map(lote => (
                  <button
                    key={lote.id}
                    onClick={() => seleccionarLote(lote)}
                    className="w-full text-left p-2 rounded border hover:bg-slate-50 transition-colors flex justify-between items-center"
                  >
                    <div>
                      <p className="font-bold text-xs text-blue-700">{lote.codigoLote}</p>
                      <p className="text-[10px] text-slate-500">
                        {lote.especie} · <Ship className="h-2.5 w-2.5 inline" /> {lote.nombreEmbarcacion}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 border bg-slate-50 px-2 py-0.5 rounded">
                      Seleccionar
                    </span>
                  </button>
                ))}
                {lotesFiltrados.length === 0 && (
                  <p className="text-xs text-center text-slate-400 py-3">No se encontraron lotes</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
