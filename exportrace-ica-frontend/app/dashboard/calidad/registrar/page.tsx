'use client'
import { useState, useEffect, useRef } from 'react'
import { getLoteById, getLotes, getEspecies } from '@/lib/api/lotes'
import { registrarTemperatura } from '@/lib/api/calidad'
import type { LotePesca, Especie } from '@/types'
import { ESPECIES_MOCK } from '@/types'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Thermometer, AlertTriangle, QrCode, X, Camera, Search, Ship, CheckCircle2 } from 'lucide-react'

const schema = z.object({
  idLote: z.coerce.number().positive('ID de lote requerido'),
  idInspector: z.coerce.number().positive('ID de inspector requerido'),
  temperaturaCelsius: z.coerce.number(),
  idCamara: z.string().min(1, 'Cámara requerida'),
  observaciones: z.string().optional(),
  timestampMedicion: z.string().min(1, 'Fecha requerida'),
})

type FormData = z.infer<typeof schema>

const defaultValues: FormData = {
  idLote: 0,
  idInspector: 2,
  temperaturaCelsius: 0,
  idCamara: '',
  observaciones: '',
  timestampMedicion: new Date().toISOString().slice(0, 16),
}

export default function RegistrarTemperaturaPage() {
  const [especies, setEspecies] = useState<Especie[]>(ESPECIES_MOCK)
  const [lotesDisponibles, setLotesDisponibles] = useState<LotePesca[]>([])
  const [loteInfo, setLoteInfo] = useState<LotePesca | null>(null)
  const [especieLote, setEspecieLote] = useState<Especie | null>(null)
  const [tempFuera, setTempFuera] = useState(false)
  const [confirmFuera, setConfirmFuera] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [filtroLote, setFiltroLote] = useState('')
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const idLoteWatch = watch('idLote')
  const tempWatch = watch('temperaturaCelsius')

  useEffect(() => {
    getEspecies().then(setEspecies).catch(() => {})
    getLotes().then(setLotesDisponibles).catch(() => {})
  }, [])

  useEffect(() => {
    if (!idLoteWatch || idLoteWatch === 0) return
    getLoteById(idLoteWatch).then(l => {
      setLoteInfo(l)
      const esp = especies.find(e => e.nombreComun === l.especie) || ESPECIES_MOCK.find(e => e.nombreComun === l.especie)
      setEspecieLote(esp || null)
    }).catch(() => {
      setLoteInfo(null)
      setEspecieLote(null)
    })
  }, [idLoteWatch, especies])

  useEffect(() => {
    if (tempWatch && especieLote) {
      const fuera = tempWatch < especieLote.tempMinCelsius || tempWatch > especieLote.tempMaxCelsius
      setTempFuera(fuera)
      if (!fuera) setConfirmFuera(false)
    }
  }, [tempWatch, especieLote])

  useEffect(() => {
    if (showScanner) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          setCameraStream(stream)
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream
              videoRef.current.play().catch(() => {})
            }
          }, 300)
        })
        .catch(() => {
          toast.error('No se pudo acceder a la cámara')
        })
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
        setCameraStream(null)
      }
    }
  }, [showScanner])

  const closeScanner = () => {
    setShowScanner(false)
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
    }
  }

  const handleSimularEscaneo = (lote: LotePesca) => {
    setValue('idLote', lote.id)
    setLoteInfo(lote)
    const esp = especies.find(e => e.nombreComun === lote.especie) || ESPECIES_MOCK.find(e => e.nombreComun === lote.especie)
    setEspecieLote(esp || null)
    closeScanner()
    setFiltroLote('')
    toast.success(`Lote ${lote.codigoLote} seleccionado`)
  }

  const onSubmit = async (data: FormData) => {
    if (tempFuera && !confirmFuera) {
      toast.warning('Confirma la temperatura fuera de rango')
      return
    }
    try {
      const payload = {
        idLote: Number(data.idLote),
        idInspector: Number(data.idInspector),
        temperaturaCelsius: Number(data.temperaturaCelsius),
        idCamara: data.idCamara,
        observaciones: data.observaciones || '',
        timestampMedicion: data.timestampMedicion ? data.timestampMedicion.replace('T', 'T') + ':00' : new Date().toISOString().slice(0, 19),
      }
      await registrarTemperatura(payload as any)
      toast.success('Temperatura registrada correctamente')
      reset(defaultValues)
      setLoteInfo(null)
      setEspecieLote(null)
      setTempFuera(false)
      setConfirmFuera(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar temperatura')
    }
  }

  const lotesFiltrados = lotesDisponibles.filter(l =>
    l.codigoLote.toLowerCase().includes(filtroLote.toLowerCase()) ||
    l.especie.toLowerCase().includes(filtroLote.toLowerCase())
  )

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-indigo-600" />
            Registrar Temperatura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lote de Pescado</label>
              <div className="flex gap-2">
                <Input type="number" {...register('idLote')} placeholder="ID del lote" className="flex-1" />
                <Button type="button" onClick={() => { getLotes().then(setLotesDisponibles); setShowScanner(true) }}>
                  <QrCode className="h-4 w-4 mr-1" /> Escanear QR
                </Button>
              </div>
              {errors.idLote && <p className="text-xs text-red-500">{errors.idLote.message}</p>}
              {loteInfo && (
                <div className="p-3 bg-slate-50 border rounded-lg text-sm">
                  <span className="font-bold">{loteInfo.codigoLote}</span> - {loteInfo.especie} - {loteInfo.nombreEmbarcacion}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cámara o Túnel</label>
              <Select {...register('idCamara')}>
                <option value="">Seleccionar cámara...</option>
                <option value="CAMARA-01">CAMARA-01</option>
                <option value="CAMARA-02">CAMARA-02</option>
                <option value="TUNEL-01">TUNEL-01</option>
                <option value="TUNEL-02">TUNEL-02</option>
              </Select>
              {errors.idCamara && <p className="text-xs text-red-500">{errors.idCamara.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Temperatura (°C)</label>
              <Input type="number" step="0.1" {...register('temperaturaCelsius')} placeholder="-18.5" />
              {tempFuera && especieLote && !confirmFuera && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4 inline mr-1 text-amber-600" />
                  Fuera de rango ({especieLote.tempMinCelsius}°C a {especieLote.tempMaxCelsius}°C)
                  <Button type="button" size="sm" className="ml-2 bg-amber-600 text-white" onClick={() => setConfirmFuera(true)}>
                    Confirmar
                  </Button>
                </div>
              )}
              {tempFuera && confirmFuera && (
                <Badge className="bg-amber-100 text-amber-800">
                  <AlertTriangle className="h-3 w-3 mr-1" /> Anomalía confirmada
                </Badge>
              )}
              {!tempFuera && especieLote && (
                <span className="text-xs text-green-600">
                  <CheckCircle2 className="h-3 w-3 inline mr-1" />
                  Dentro del rango permitido
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ID Inspector</label>
                <Input type="number" {...register('idInspector')} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha y Hora</label>
                <Input type="datetime-local" {...register('timestampMedicion')} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Observaciones</label>
              <Textarea {...register('observaciones')} placeholder="Notas opcionales" />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || (tempFuera && !confirmFuera)}>
              {isSubmitting ? 'Registrando...' : 'Registrar Temperatura'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeScanner}>
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <span className="font-bold">Escanear QR</span>
              <button onClick={closeScanner}><X className="h-5 w-5" /></button>
            </div>
            <div className="relative h-64 bg-slate-950 flex items-center justify-center">
              {cameraStream ? (
                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <QrCode className="h-16 w-16 text-slate-600 animate-pulse" />
              )}
            </div>
            <div className="p-4 border-t">
              <Input value={filtroLote} onChange={e => setFiltroLote(e.target.value)} placeholder="Buscar lote..." className="mb-3" />
              <div className="max-h-48 overflow-y-auto space-y-2">
                {lotesFiltrados.map(lote => (
                  <button key={lote.id} onClick={() => handleSimularEscaneo(lote)} className="w-full text-left p-3 border rounded hover:bg-slate-50">
                    <p className="font-bold text-sm text-blue-700">{lote.codigoLote}</p>
                    <p className="text-xs text-slate-500">{lote.especie} - {lote.nombreEmbarcacion}</p>
                  </button>
                ))}
                {lotesFiltrados.length === 0 && <p className="text-xs text-center text-slate-500 py-4">No se encontraron lotes</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
