'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getLoteById } from '@/lib/api/lotes'
import { getTemperaturasPorLote, getResumenFrio } from '@/lib/api/calidad'
import { getExpediente, solicitarCertificado } from '@/lib/api/certificaciones'
import { useAuthStore } from '@/store/authStore'
import type { LotePesca, AuditoriaCalidad, ResumenFrio, ExpedienteCertificado, Especie } from '@/types'
import { LOTES_MOCK, ESPECIES_MOCK } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { ArrowLeft, Thermometer, FileCheck, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { formatDateTime } from '@/lib/utils'

const getInspectorName = (id: number | string) => {
  const nid = Number(id)
  if (nid === 2) return 'Inspector de Calidad (calidad)'
  if (nid === 1) return 'Administrador (admin)'
  return `Inspector #${id}`
}

export default function LoteDetallePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const usuario = useAuthStore(s => s.usuario)
  const loteId = Number(id)

  const [lote, setLote] = useState<LotePesca | null>(null)
  const [temperaturas, setTemperaturas] = useState<AuditoriaCalidad[]>([])
  const [resumen, setResumen] = useState<ResumenFrio | null>(null)
  const [expediente, setExpediente] = useState<ExpedienteCertificado | null>(null)
  const [loading, setLoading] = useState(true)
  const [solicitando, setSolicitando] = useState(false)

  useEffect(() => {
    if (!loteId) return
    Promise.all([
      getLoteById(loteId).catch(() => LOTES_MOCK.find(l => l.id === loteId) || null),
      getTemperaturasPorLote(loteId).catch(() => []),
      getResumenFrio(loteId).catch(() => null),
      getExpediente(loteId).catch(() => null),
    ]).then(([l, temps, res, exp]) => {
      setLote(l)
      setTemperaturas(temps)
      setResumen(res)
      setExpediente(exp)
    }).finally(() => setLoading(false))
  }, [loteId])

  const handleSolicitarCertificado = async () => {
    setSolicitando(true)
    try {
      await solicitarCertificado(loteId)
      toast.success('Certificado solicitado exitosamente')
      const exp = await getExpediente(loteId)
      setExpediente(exp)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al solicitar certificado')
    } finally {
      setSolicitando(false)
    }
  }

  if (loading) return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-48 rounded-lg" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )

  if (!lote) return <div className="text-center py-12"><p className="text-muted-foreground">Lote no encontrado</p><Button onClick={() => router.push('/dashboard/lotes')} className="mt-4">Volver</Button></div>

  const chartData = temperaturas.map(t => ({
    time: new Date(t.timestampMedicion).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
    temp: t.temperaturaCelsius,
    dentro: true,
  }))

  const especieInfo = ESPECIES_MOCK.find(e => e.nombreComun === lote.especie)

  return (
    <div className="space-y-6">
      <Link href="/dashboard/lotes" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Volver a lotes
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{lote.codigoLote}</CardTitle>
            <div className="flex gap-2">
              <Badge variant={lote.estadoCadenaFrio === 'OK' ? 'success' : lote.estadoCadenaFrio === 'ALERTA' ? 'warning' : 'danger'} className="text-sm px-3 py-1">
                <Thermometer className="h-3 w-3 mr-1" /> {lote.estadoCadenaFrio}
              </Badge>
              <Badge variant={lote.estadoSanipes === 'APROBADO' || lote.estadoSanipes === 'APTO_EXPORTACION' ? 'success' : lote.estadoSanipes === 'RECHAZADO' ? 'danger' : 'gray'} className="text-sm px-3 py-1">
                <FileCheck className="h-3 w-3 mr-1" /> {lote.estadoSanipes}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div><p className="text-sm text-muted-foreground">Especie</p><p className="font-medium">{lote.especie}</p></div>
          <div><p className="text-sm text-muted-foreground">Embarcación</p><p className="font-medium">{lote.nombreEmbarcacion}</p></div>
          <div><p className="text-sm text-muted-foreground">Matrícula</p><p className="font-medium">{lote.matriculaEmbarcacion || '—'}</p></div>
          <div><p className="text-sm text-muted-foreground">Capitán</p><p className="font-medium">{lote.capitanEmbarcacion || '—'}</p></div>
          <div><p className="text-sm text-muted-foreground">Empresa</p><p className="font-medium">{lote.empresaRazonSocial || '—'}</p></div>
          <div><p className="text-sm text-muted-foreground">RUC</p><p className="font-medium">{lote.empresaRuc || '—'}</p></div>
          <div><p className="text-sm text-muted-foreground">Peso</p><p className="font-medium">{lote.pesoKg} kg</p></div>
          <div><p className="text-sm text-muted-foreground">Recepción</p><p className="font-medium">{formatDateTime(lote.fechaRecepcion)}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg"><Thermometer className="h-5 w-5 inline mr-2" />Historial de Temperaturas</CardTitle></CardHeader>
        <CardContent>
          {chartData.length > 0 && especieInfo && (
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" fontSize={11} />
                  <YAxis domain={[especieInfo.tempMinCelsius - 5, especieInfo.tempMaxCelsius + 5]} fontSize={11} />
                  <Tooltip />
                  <ReferenceLine y={especieInfo.tempMaxCelsius} stroke="#dc2626" strokeDasharray="5 5" label={{ value: 'Máx', position: 'right', fontSize: 10 }} />
                  <ReferenceLine y={especieInfo.tempMinCelsius} stroke="#0f4c81" strokeDasharray="5 5" label={{ value: 'Mín', position: 'right', fontSize: 10 }} />
                  <Line type="monotone" dataKey="temp" stroke="#0f4c81" strokeWidth={2} dot={{ r: 4, fill: '#0f4c81' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {chartData.length === 0 && <p className="text-sm text-muted-foreground mb-4">No hay mediciones registradas</p>}

          {resumen && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="bg-slate-50 p-3 rounded-lg text-center"><p className="text-xs text-muted-foreground">Mín</p><p className="text-lg font-bold">{resumen.tempMin}°C</p></div>
              <div className="bg-slate-50 p-3 rounded-lg text-center"><p className="text-xs text-muted-foreground">Máx</p><p className="text-lg font-bold">{resumen.tempMax}°C</p></div>
              <div className="bg-slate-50 p-3 rounded-lg text-center"><p className="text-xs text-muted-foreground">Promedio</p><p className="text-lg font-bold">{resumen.tempPromedio.toFixed(1)}°C</p></div>
              <div className={`p-3 rounded-lg text-center ${resumen.hayAlerta ? 'bg-yellow-50' : 'bg-green-50'}`}>
                <p className="text-xs text-muted-foreground">Estado</p>
                <Badge variant={resumen.estadoCadenaFrio === 'OK' ? 'success' : resumen.estadoCadenaFrio === 'ALERTA' ? 'warning' : 'danger'}>{resumen.estadoCadenaFrio}</Badge>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Cámara</TableHead>
                <TableHead>Temperatura</TableHead>
                <TableHead>Inspector</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {temperaturas.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{formatDateTime(t.timestampMedicion)}</TableCell>
                  <TableCell>{t.idCamara}</TableCell>
                  <TableCell className={t.temperaturaCelsius < (especieInfo?.tempMinCelsius || -99) || t.temperaturaCelsius > (especieInfo?.tempMaxCelsius || 99) ? 'text-danger font-medium' : ''}>
                    {t.temperaturaCelsius}°C
                  </TableCell>
                  <TableCell>{getInspectorName(t.idInspector)}</TableCell>
                </TableRow>
              ))}
              {temperaturas.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">Sin registros</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg"><FileCheck className="h-5 w-5 inline mr-2" />Certificación</CardTitle></CardHeader>
        <CardContent>
          {expediente ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="success">APROBADO</Badge>
                <span className="text-sm">Certificado: {expediente.tramite.numeroCertificado}</span>
              </div>
              {expediente.aptoParaExportacion && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Apto para exportación
                </div>
              )}
              <Link href={`/dashboard/certificaciones/${loteId}`}>
                <Button variant="outline">Ver Expediente Completo</Button>
              </Link>
            </div>
          ) : (
            <div>
              {usuario && (usuario.rol === 'ADMIN' || usuario.rol === 'LOGISTICA') && (
                <Button onClick={handleSolicitarCertificado} disabled={solicitando}>
                  {solicitando ? 'Solicitando...' : 'Solicitar Certificado SANIPES'}
                </Button>
              )}
              {(usuario?.rol === 'QA' || usuario?.rol === 'TI') && (
                <p className="text-sm text-muted-foreground">Solicita la certificación con un usuario ADMIN o LOGISTICA</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
