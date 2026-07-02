'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getExpediente } from '@/lib/api/certificaciones'
import { getTemperaturasPorLote } from '@/lib/api/calidad'
import type { ExpedienteCertificado, AuditoriaCalidad } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { ArrowLeft, Printer, Copy, FileCheck, Thermometer, Fish, QrCode, Truck } from 'lucide-react'
import { formatDate, formatDateTime, calcularTiempoEnPlanta } from '@/lib/utils'
import { QRCodeSVG } from 'qrcode.react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'

export default function ExpedientePage() {
  const { idLote } = useParams<{ idLote: string }>()
  const router = useRouter()
  const loteId = Number(idLote)
  const [expediente, setExpediente] = useState<ExpedienteCertificado | null>(null)
  const [temperaturas, setTemperaturas] = useState<AuditoriaCalidad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!loteId) return
    Promise.all([
      getExpediente(loteId).catch(() => null),
      getTemperaturasPorLote(loteId).catch(() => []),
    ]).then(([exp, temps]) => {
      setExpediente(exp)
      setTemperaturas(temps)
    }).finally(() => setLoading(false))
  }, [loteId])

  const handleCopyLink = async () => {
    if (expediente?.qrData) {
      await navigator.clipboard.writeText(expediente.qrData)
      toast.success('Enlace QR copiado al portapapeles')
    }
  }

  if (loading) return <div className="space-y-4"><Skeleton className="h-8 w-32" /><Skeleton className="h-96 rounded-lg" /></div>
  if (!expediente) return <div className="text-center py-12"><p className="text-muted-foreground">Expediente no encontrado</p></div>

  const chartData = temperaturas.slice(-24).map(t => ({
    time: new Date(t.timestampMedicion).toLocaleTimeString(),
    temp: t.temperaturaCelsius,
  }))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between no-print">
        <Link href="/dashboard/certificaciones" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" /> Imprimir</Button>
          <Button variant="outline" onClick={handleCopyLink}><Copy className="h-4 w-4 mr-1" /> Copiar QR</Button>
        </div>
      </div>

      <div className="text-center border-b pb-4">
        <h1 className="text-2xl font-bold text-primary"><Fish className="h-6 w-6 inline mr-2" />ExporTrace Ica</h1>
        <p className="text-lg font-semibold mt-1">EXPEDIENTE DE EXPORTACIÓN CERTIFICADO</p>
        <p className="text-sm text-muted-foreground">
          N° Certificado: {expediente.tramite.numeroCertificado} | Fecha: {expediente.tramite.fechaAprobacion ? formatDate(expediente.tramite.fechaAprobacion) : '—'}
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg"><Fish className="h-5 w-5 inline mr-2" />Datos del Lote</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><p className="text-xs text-muted-foreground">Código</p><p className="font-medium">{expediente.lote.codigoLote}</p></div>
            <div><p className="text-xs text-muted-foreground">Especie</p><p className="font-medium">{expediente.lote.especie}</p></div>
            <div><p className="text-xs text-muted-foreground">Embarcación</p><p className="font-medium">{expediente.lote.nombreEmbarcacion}</p></div>
            <div><p className="text-xs text-muted-foreground">Matrícula</p><p className="font-medium">{expediente.lote.matriculaEmbarcacion || '—'}</p></div>
            <div><p className="text-xs text-muted-foreground">Empresa</p><p className="font-medium">{expediente.lote.empresaRazonSocial || '—'}</p></div>
            <div><p className="text-xs text-muted-foreground">RUC</p><p className="font-medium">{expediente.lote.empresaRuc || '—'}</p></div>
            <div><p className="text-xs text-muted-foreground">Peso</p><p className="font-medium">{expediente.lote.pesoKg} kg</p></div>
            <div><p className="text-xs text-muted-foreground">Recepción</p><p className="font-medium">{formatDate(expediente.lote.fechaRecepcion)}</p></div>
            <div><p className="text-xs text-muted-foreground">Fecha Salida</p><p className="font-medium">{expediente.fechaSalidaLote ? formatDateTime(expediente.fechaSalidaLote) : <span className="text-muted-foreground">No registrada</span>}</p></div>
            <div><p className="text-xs text-muted-foreground">Tiempo en Planta</p><p className="font-medium">{expediente.fechaSalidaLote ? (calcularTiempoEnPlanta(expediente.lote.fechaRecepcion, expediente.fechaSalidaLote) || '—') : <span className="text-muted-foreground">—</span>}</p></div>
            <div><p className="text-xs text-muted-foreground">Estado SANIPES</p><Badge variant={expediente.lote.estadoSanipes === 'APTO_EXPORTACION' ? 'info' : 'success'}>{expediente.lote.estadoSanipes}</Badge></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg"><Thermometer className="h-5 w-5 inline mr-2" />Resumen Cadena de Frío</CardTitle></CardHeader>
        <CardContent>
          {expediente.resumenFrio ? (
            <>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-slate-50 p-3 rounded-lg text-center"><p className="text-xs text-muted-foreground">Mín</p><p className="text-xl font-bold">{expediente.resumenFrio.tempMin}°C</p></div>
                <div className="bg-slate-50 p-3 rounded-lg text-center"><p className="text-xs text-muted-foreground">Máx</p><p className="text-xl font-bold">{expediente.resumenFrio.tempMax}°C</p></div>
                <div className="bg-slate-50 p-3 rounded-lg text-center"><p className="text-xs text-muted-foreground">Promedio</p><p className="text-xl font-bold">{expediente.resumenFrio.tempPromedio?.toFixed(1) || '—'}°C</p></div>
                <div className={`p-3 rounded-lg text-center ${expediente.resumenFrio.estadoCadenaFrio === 'OK' ? 'bg-green-50' : expediente.resumenFrio.estadoCadenaFrio === 'ALERTA' ? 'bg-yellow-50' : 'bg-red-50'}`}>
                  <p className="text-xs text-muted-foreground">Estado</p>
                  <Badge variant={expediente.resumenFrio.estadoCadenaFrio === 'OK' ? 'success' : expediente.resumenFrio.estadoCadenaFrio === 'ALERTA' ? 'warning' : 'danger'}>{expediente.resumenFrio.estadoCadenaFrio}</Badge>
                </div>
              </div>
              {chartData.length > 0 && (
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                      <Line type="monotone" dataKey="temp" stroke="#0f4c81" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No hay mediciones de temperatura registradas para este lote.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg"><FileCheck className="h-5 w-5 inline mr-2" />Certificado SANIPES</CardTitle></CardHeader>
        <CardContent>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">N° Certificado</p><p className="font-medium text-lg">{expediente.tramite.numeroCertificado}</p></div>
            <div><p className="text-xs text-muted-foreground">Fecha Aprobación</p><p className="font-medium">{expediente.tramite.fechaAprobacion ? formatDate(expediente.tramite.fechaAprobacion) : '—'}</p></div>
            <div><p className="text-xs text-muted-foreground">Estado</p><Badge variant="success" className="text-sm">APROBADO</Badge></div>
            <div><p className="text-xs text-muted-foreground">Apto Exportación</p><Badge variant={expediente.aptoParaExportacion ? 'success' : 'gray'}>{expediente.aptoParaExportacion ? 'SÍ' : 'NO'}</Badge></div>
            {expediente.fechaSalidaLote && (
              <div className="col-span-2 mt-2"><Badge variant="info" className="text-sm"><Truck className="h-3 w-3 mr-1" /> LISTO PARA DESPACHO - Paracas</Badge></div>
            )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg"><QrCode className="h-5 w-5 inline mr-2" />Código QR</CardTitle></CardHeader>
        <CardContent className="flex flex-col items-center">
          {expediente.qrData && (
            <QRCodeSVG value={expediente.qrData} size={180} />
          )}
          <p className="text-xs text-muted-foreground mt-2">{expediente.qrData}</p>
        </CardContent>
      </Card>
    </div>
  )
}
