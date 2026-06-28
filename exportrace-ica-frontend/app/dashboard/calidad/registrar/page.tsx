'use client'
import { useState, useEffect } from 'react'
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

export default function RegistrarTemperaturaPage() {
  const [especies, setEspecies] = useState<Especie[]>(ESPECIES_MOCK)
  const [lotesDisponibles, setLotesDisponibles] = useState<LotePesca[]>([])
  const [loteInfo, setLoteInfo] = useState<LotePesca | null>(null)
  const [especieLote, setEspecieLote] = useState<Especie | null>(null)
  const [tempFuera, setTempFuera] = useState(false)
  const [confirmFuera, setConfirmFuera] = useState(false)
  
  // Estado para el modal del escáner
  const [showScanner, setShowScanner] = useState(false)
  const [filtroLote, setFiltroLote] = useState('')
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    if (showScanner) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          setCameraStream(stream)
          setTimeout(() => {
            const video = document.getElementById('scanner-video') as HTMLVideoElement
            if (video) {
              video.srcObject = stream
              video.play().catch(e => console.error("Error playing video:", e))
            }
          }, 300)
        })
        .catch(err => {
          console.error('Error al acceder a la cámara:', err)
          toast.error('No se pudo acceder a la cámara. Usando modo de simulación manual.')
        })
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
        setCameraStream(null)
      }
    }
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [showScanner])

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { timestampMedicion: new Date().toISOString().slice(0, 16), idInspector: 2 }
  })

  const idLoteWatch = watch('idLote')
  const tempWatch = watch('temperaturaCelsius')

  // Cargar especies y lotes al inicio
  useEffect(() => {
    getEspecies().then(setEspecies).catch(() => {})
    getLotes().then(setLotesDisponibles).catch(() => {})
  }, [])

  useEffect(() => {
    if (!idLoteWatch) return
    getLoteById(idLoteWatch).then(l => {
      setLoteInfo(l)
      const esp = especies.find(e => e.nombreComun === l.especie) || ESPECIES_MOCK.find(e => e.nombreComun === l.especie)
      setEspecieLote(esp || null)
    }).catch(() => {
      setLoteInfo(null)
      setEspecieLote(null)
    })
  }, [idLoteWatch])

  useEffect(() => {
    if (tempWatch && especieLote) {
      const fuera = tempWatch < especieLote.tempMinCelsius || tempWatch > especieLote.tempMaxCelsius
      setTempFuera(fuera)
      if (!fuera) setConfirmFuera(false)
    }
  }, [tempWatch, especieLote])

  // Reproducir sonido de "Beep" al escanear exitosamente
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioCtx.createOscillator()
      const gainNode = audioCtx.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime)
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime)
      oscillator.start()
      oscillator.stop(audioCtx.currentTime + 0.15)
    } catch (e) {
      console.warn('AudioContext no soportado o bloqueado por políticas del navegador.')
    }
  }

  // Simular la detección del código QR
  const handleSimularEscaneo = (lote: LotePesca) => {
    playBeep()
    setValue('idLote', lote.id as any)
    setShowScanner(false)
    toast.success(`Código QR escaneado: ${lote.codigoLote}`)
  }

  const onSubmit = async (data: FormData) => {
    if (tempFuera && !confirmFuera) {
      toast.warning('Esta temperatura está fuera del rango permitido. Confirma para continuar.')
      return
    }
    try {
      await registrarTemperatura({
        ...data,
        timestampMedicion: new Date(data.timestampMedicion).toISOString(),
      })
      toast.success('Temperatura registrada')
      setValue('temperaturaCelsius', 0 as any)
      setValue('idCamara', '' as any)
      setValue('observaciones', '')
      setTempFuera(false)
      setConfirmFuera(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar temperatura')
    }
  }

  const lotesFiltrados = lotesDisponibles.filter(l => 
    l.codigoLote.toLowerCase().includes(filtroLote.toLowerCase()) ||
    l.especie.toLowerCase().includes(filtroLote.toLowerCase()) ||
    l.nombreEmbarcacion.toLowerCase().includes(filtroLote.toLowerCase())
  )

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="flex items-center text-slate-800">
            <Thermometer className="h-5 w-5 mr-2 text-indigo-600 animate-pulse" />
            Registrar Temperatura (QualityTrac Mobile)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Lote de Pescado</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input 
                    type="number" 
                    {...register('idLote')} 
                    placeholder="Digita ID del lote" 
                    className="pr-10" 
                  />
                  {idLoteWatch && (
                    <span className="absolute right-3 top-2.5 text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                      ID: {idLoteWatch}
                    </span>
                  )}
                </div>
                <Button 
                  type="button" 
                  onClick={() => {
                    // Refrescar lotes antes de abrir
                    getLotes().then(setLotesDisponibles).catch(() => {})
                    setShowScanner(true)
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <QrCode className="h-4 w-4" />
                  Escanear QR
                </Button>
              </div>
              
              {loteInfo && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm flex justify-between items-center transition-all animate-fadeIn">
                  <div>
                    <span className="font-bold text-slate-800">{loteInfo.codigoLote}</span>
                    <span className="mx-2 text-slate-400">|</span>
                    <span className="text-slate-600 font-medium">{loteInfo.especie}</span>
                  </div>
                  <Badge variant="gray" className="bg-white border-slate-300 text-slate-600 flex items-center gap-1">
                    <Ship className="h-3.5 w-3.5 text-slate-400" />
                    {loteInfo.nombreEmbarcacion}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Cámara o Túnel</label>
              <Select {...register('idCamara')}>
                <option value="">Seleccionar cámara...</option>
                <option value="CAMARA-01">CAMARA-01</option>
                <option value="CAMARA-02">CAMARA-02</option>
                <option value="TUNEL-01">TUNEL-01</option>
                <option value="TUNEL-02">TUNEL-02</option>
                <option value="TUNEL-03">TUNEL-03</option>
              </Select>
              {errors.idCamara && <p className="text-xs text-red-500 mt-1">{errors.idCamara.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Temperatura (°C)</label>
              <Input type="number" step="0.1" {...register('temperaturaCelsius')} placeholder="Ej: -18.5" />
              {tempFuera && especieLote && (
                <div className="mt-2">
                  {!confirmFuera ? (
                    <div className="flex flex-col gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                        <span className="font-semibold">Alerta de cadena de frío:</span>
                      </div>
                      <p>
                        Esta temperatura está fuera del rango permitido para {especieLote.nombreComun} ({especieLote.tempMinCelsius}°C a {especieLote.tempMaxCelsius}°C).
                      </p>
                      <Button 
                        type="button" 
                        size="sm" 
                        className="bg-amber-600 hover:bg-amber-700 text-white self-start mt-1"
                        onClick={() => setConfirmFuera(true)}
                      >
                        Confirmar registro con anomalía
                      </Button>
                    </div>
                  ) : (
                    <Badge className="bg-amber-100 hover:bg-amber-100 border border-amber-300 text-amber-800 font-semibold mt-1 flex items-center gap-1 w-max">
                      <AlertTriangle className="h-3.5 w-3.5" /> Anomalía Confirmada
                    </Badge>
                  )}
                </div>
              )}
              {especieLote && !tempFuera && (
                <span className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Temperatura dentro del rango permitido ({especieLote.tempMinCelsius}°C a {especieLote.tempMaxCelsius}°C)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">ID Inspector</label>
                <Input type="number" {...register('idInspector')} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Fecha y Hora</label>
                <Input type="datetime-local" {...register('timestampMedicion')} />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Observaciones</label>
              <Textarea {...register('observaciones')} placeholder="Notas sobre el estado de la cámara o hielo (opcional)" />
            </div>

            <Button type="submit" className="w-full mt-4 bg-slate-800 hover:bg-slate-950 text-white font-semibold rounded-md shadow-sm" disabled={isSubmitting || (tempFuera && !confirmFuera)}>
              {isSubmitting ? 'Registrando...' : 'Registrar Temperatura'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* MODAL DEL ESCÁNER QR SIMULADO (ESTILO CORPORATIVO SÓLIDO) */}
      {showScanner && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-lg w-full max-w-md border border-slate-350 shadow-xl overflow-hidden animate-scaleIn">
            
            {/* Cabecera */}
            <div className="flex justify-between items-center px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Camera className="h-4 w-4 text-slate-600" />
                <span className="font-bold text-sm text-slate-800">Lector de Códigos QR</span>
              </div>
              <button 
                type="button" 
                onClick={() => setShowScanner(false)} 
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Visor de la cámara en vivo */}
            <div className="relative h-64 bg-slate-950 flex items-center justify-center overflow-hidden">
              {cameraStream ? (
                <video 
                  id="scanner-video" 
                  autoPlay 
                  playsInline 
                  muted 
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
              ) : (
                <div className="text-center px-8 z-0">
                  <QrCode className="h-16 w-16 text-slate-600 mx-auto mb-3 animate-pulse" />
                  <p className="text-xs text-slate-400">Solicitando permisos de cámara...</p>
                </div>
              )}

              {/* Esquinas de la cámara */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-indigo-550 z-10"></div>
              <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-indigo-550 z-10"></div>
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-indigo-550 z-10"></div>
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-indigo-550 z-10"></div>
              
              {/* Animación del Láser Rojo */}
              <div className="absolute w-[80%] h-0.5 bg-red-500 left-[10%] animate-laserSweep z-15"></div>
              
              {cameraStream && (
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] text-emerald-400 font-semibold border border-emerald-500/30 flex items-center gap-1 z-20">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  CÁMARA ACTIVA
                </div>
              )}
            </div>

            {/* Listado de Lotes del Sistema para simular la captura */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  value={filtroLote} 
                  onChange={(e) => setFiltroLote(e.target.value)}
                  placeholder="Buscar lote por código o barco..." 
                  className="w-full bg-white border border-slate-300 rounded pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-500 focus:ring-0"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {lotesFiltrados.length > 0 ? (
                  lotesFiltrados.map((lote) => (
                    <button
                      key={lote.id}
                      type="button"
                      onClick={() => handleSimularEscaneo(lote)}
                      className="w-full text-left p-3 rounded border border-slate-200 hover:bg-slate-50 transition-colors flex justify-between items-center text-slate-800"
                    >
                      <div>
                        <p className="font-bold text-xs text-blue-700">{lote.codigoLote}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                          Especie: <span className="text-slate-800 font-medium">{lote.especie}</span> | <Ship className="h-3 w-3 text-slate-400" /> {lote.nombreEmbarcacion}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 border border-slate-250 bg-slate-50 px-2 py-1 rounded hover:bg-slate-800 hover:text-white transition-colors">
                        Simular Escaneo
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-xs text-center text-slate-500 py-4">No se encontraron lotes disponibles en el sistema.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

