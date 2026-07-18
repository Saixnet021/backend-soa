'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useNotificacionesStore } from '@/store/notificacionesStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Anchor,
  Clipboard,
  Layers,
  Snowflake,
  Truck,
  AlertTriangle,
  ShieldCheck,
  Activity,
  ArrowRight,
  ShieldAlert,
  Thermometer,
  BookOpen,
  UserCheck
} from 'lucide-react'
import {
  getRecepciones,
  getClasificaciones,
  getProcesamientos,
  getCongelamientos,
  RecepcionResponse,
  ClasificacionResponse,
  ProcesamientoResponse,
  CongelamientoResponse
} from '@/lib/api/trazabilidad'
import { getEspecies } from '@/lib/api/lotes'
import { formatEstado } from '@/lib/utils'
import type { Especie } from '@/types'

export default function DashboardPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const setAlertasCount = useNotificacionesStore((s) => s.setAlertasCount)

  const [recepciones, setRecepciones] = useState<RecepcionResponse[]>([])
  const [clasificaciones, setClasificaciones] = useState<ClasificacionResponse[]>([])
  const [procesamientos, setProcesamientos] = useState<ProcesamientoResponse[]>([])
  const [congelamientos, setCongelamientos] = useState<CongelamientoResponse[]>([])
  const [especies, setEspecies] = useState<Especie[]>([])
  const [loading, setLoading] = useState(true)

  const checkRole = (roles: string[]) => usuario && roles.includes(usuario.rol)

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [recs, classifs, procs, congs, esps] = await Promise.all([
        getRecepciones(),
        getClasificaciones(true),
        getProcesamientos(),
        getCongelamientos(),
        getEspecies()
      ])

      setRecepciones(recs)
      setClasificaciones(classifs)
      setProcesamientos(procs)
      setCongelamientos(congs)
      setEspecies(esps)

      // Calculate cold chain alerts (e.g., temperature in center above -18°C or status = RETENIDO)
      const countAlertas = congs.filter(
        (c) => c.temperaturaCentroTermico > -18.0 || c.estadoInocuidadHACCP === 'RETENIDO'
      ).length
      setAlertasCount(countAlertas)
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    )
  }

  // Derived metrics
  const totalRecepciones = recepciones.length
  const totalClasificados = clasificaciones.length
  const totalProcesados = procesamientos.length
  const totalEnCamara = congelamientos.filter((c) => c.camaraDestino).length
  const totalDespachados = congelamientos.filter(
    (c) => c.estado === 'DESPACHADO' || c.estado === 'DESPACHADO_EN_TRANSITO'
  ).length

  // Build active alerts list
  const alertasActivas: { id: string; tipo: string; mensaje: string; nivel: 'warning' | 'danger' }[] = []

  // 1. High temperature arrivals
  recepciones.forEach((r) => {
    if (r.temperaturaLlegada > 5.0) {
      alertasActivas.push({
        id: `temp-recep-${r.idTicket}`,
        tipo: 'Recepción Crítica',
        mensaje: `Temp. llegada ${r.temperaturaLlegada}°C en embarcación ${r.nombreEmbarcacion} (DER: ${r.numeroDER}) supera límite de 5.0°C.`,
        nivel: 'danger'
      })
    }
  })

  // 2. Rejected classifications
  clasificaciones.forEach((c) => {
    if (c.estado === 'RECHAZADO_TOTAL') {
      alertasActivas.push({
        id: `clasif-rechazo-${c.id}`,
        tipo: 'Calidad Rechazada',
        mensaje: `Lote de recepción #${c.loteOrigen.idTicket} fue RECHAZADO por QA: ${c.motivoRechazo || 'Sin motivo indicado'}.`,
        nivel: 'danger'
      })
    }
  })

  // 3. Cold chain temperature breaches or Retained status
  congelamientos.forEach((c) => {
    if (c.temperaturaCentroTermico > -18.0) {
      alertasActivas.push({
        id: `congelamiento-temp-${c.id}`,
        tipo: 'Brecha Cadena Frío',
        mensaje: `Lote de producción ${c.loteOrigen.idLoteProduccion} en Túnel ${c.numeroTunel} tiene temp de ${c.temperaturaCentroTermico}°C (debe ser ≤ -18°C).`,
        nivel: 'danger'
      })
    }
    if (c.estadoInocuidadHACCP === 'RETENIDO') {
      alertasActivas.push({
        id: `congelamiento-haccp-${c.id}`,
        tipo: 'Retenido HACCP',
        mensaje: `Lote ${c.loteOrigen.idLoteProduccion} se encuentra RETENIDO en cámara ${c.camaraDestino || '—'} por observación sanitaria.`,
        nivel: 'warning'
      })
    }
  })

  // 4. Species in Veda
  especies.forEach((e) => {
    if (e.enVeda) {
      alertasActivas.push({
        id: `especie-veda-${e.id}`,
        tipo: 'Especie en Veda',
        mensaje: `La especie ${e.nombreComun} (${e.nombreCientifico}) está en periodo de VEDA oficial. Recepción bloqueada.`,
        nivel: 'warning'
      })
    }
  })

  // Recent activity list
  const actividadesRecientes = [...recepciones]
    .sort((a, b) => new Date(b.fechaHoraIngreso).getTime() - new Date(a.fechaHoraIngreso).getTime())
    .slice(0, 5)

  // Step stages config
  const stages = [
    { label: 'Recepción', count: totalRecepciones, icon: Anchor, color: 'text-blue-600', bg: 'bg-blue-50', link: '/dashboard/recepcion' },
    { label: 'Clasificación', count: totalClasificados, icon: Clipboard, color: 'text-indigo-600', bg: 'bg-indigo-50', link: '/dashboard/clasificacion' },
    { label: 'Procesamiento', count: totalProcesados, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50', link: '/dashboard/procesamiento' },
    { label: 'Congelamiento', count: totalEnCamara, icon: Snowflake, color: 'text-cyan-600', bg: 'bg-cyan-50', link: '/dashboard/congelamiento' },
    { label: 'Despacho', count: totalDespachados, icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50', link: '/dashboard/despacho' }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Premium Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-10 -translate-y-10 scale-150">
          <Activity className="w-96 h-96" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Badge className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold uppercase tracking-wider text-[10px] px-2.5 py-1">
              ExporTrace Ica · Monitoreo SOA
            </Badge>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Control de Trazabilidad y Exportación
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Consulte y gestione las etapas clave de inocuidad alimentaria desde la descarga en muelle hasta el despacho comercial.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-xl flex items-center gap-3 self-start md:self-auto">
            <div className="bg-cyan-500/20 p-2 rounded-lg">
              <UserCheck className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Usuario Logueado</p>
              <p className="text-sm font-bold text-slate-100">{usuario?.username || 'Invitado'}</p>
              <p className="text-[11px] text-slate-300 font-mono mt-0.5">{usuario?.rol || 'SIN ROL'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Step Process Flow Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stages.map((stage) => {
          const Icon = stage.icon
          return (
            <Card key={stage.label} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${stage.bg} ${stage.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">{stage.count}</p>
                  <p className="text-xs font-bold text-slate-500">{stage.label}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Activity & Species Veda */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Activity Card */}
          <Card className="shadow-sm border rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-600" /> Historial Reciente de Trazabilidad
              </CardTitle>
              <Link href="/dashboard/trazabilidad">
                <Button variant="ghost" size="sm" className="text-xs text-indigo-600 font-bold hover:bg-slate-100">
                  Ver Resumen General <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Embarcación</TableHead>
                    <TableHead>Especie</TableHead>
                    <TableHead>Peso Bruto</TableHead>
                    <TableHead>Fecha Ingreso</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actividadesRecientes.map((r) => (
                    <TableRow key={r.idTicket} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-bold text-indigo-950"># {r.idTicket}</TableCell>
                      <TableCell className="font-medium text-slate-700 text-xs">
                        {r.nombreEmbarcacion}
                      </TableCell>
                      <TableCell className="text-xs font-semibold">{r.especie}</TableCell>
                      <TableCell className="text-xs">{r.pesoBrutoBascula} kg</TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(r.fechaHoraIngreso).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                          style={{ backgroundColor: `${r.colorHex}20`, color: r.colorHex }}
                        >
                          {formatEstado(r.estado)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {actividadesRecientes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                        No hay registros recientes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Especies & Veda status Card */}
          <Card className="shadow-sm border rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" /> Control de Vedas y Especies
              </CardTitle>
              {checkRole(['ADMIN']) && (
                <Link href="/dashboard/especies">
                  <Button variant="ghost" size="sm" className="text-xs text-indigo-600 font-bold hover:bg-slate-100">
                    Gestionar Vedas <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {especies.map((e) => (
                  <div
                    key={e.id}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      e.enVeda
                        ? 'bg-red-50/50 border-red-200'
                        : 'bg-emerald-50/30 border-emerald-100'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{e.nombreComun}</p>
                      <p className="text-xs text-slate-500 italic mt-0.5">{e.nombreCientifico}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Cód. SANIPES: {e.codigoSanipes}</p>
                    </div>
                    <div className="text-right">
                      {e.enVeda ? (
                        <Badge className="bg-red-600 text-white font-bold uppercase tracking-wider text-[9px] px-2 py-0.5">
                          En Veda Oficial
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-600 text-white font-bold uppercase tracking-wider text-[9px] px-2 py-0.5">
                          Activa / Permitida
                        </Badge>
                      )}
                      <p className="text-[10px] text-slate-500 mt-2 font-medium">
                        Rango: {e.tempMinCelsius}°C a {e.tempMaxCelsius}°C
                      </p>
                    </div>
                  </div>
                ))}
                {especies.length === 0 && (
                  <p className="text-xs text-slate-500 italic col-span-2">No hay especies registradas en el sistema.</p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Active Alerts & Shortcuts */}
        <div className="space-y-6">
          
          {/* Active Alerts Card */}
          <Card className="shadow-sm border rounded-2xl">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500" /> Monitoreo y Alertas Sanitarias
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 max-h-[350px] overflow-y-auto space-y-3">
              {alertasActivas.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-emerald-800">Todo conforme</h5>
                    <p className="text-[11px] text-emerald-600 mt-0.5">
                      No se detectaron brechas térmicas ni alertas sanitarias activas en ningún lote.
                    </p>
                  </div>
                </div>
              ) : (
                alertasActivas.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-xl border flex gap-2.5 text-xs ${
                      alert.nivel === 'danger'
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    <ShieldAlert
                      className={`h-5 w-5 shrink-0 mt-0.5 ${
                        alert.nivel === 'danger' ? 'text-red-600' : 'text-amber-600'
                      }`}
                    />
                    <div>
                      <span className="font-extrabold uppercase tracking-wider text-[9px] block">
                        {alert.tipo}
                      </span>
                      <p className="mt-0.5 font-medium leading-snug">{alert.mensaje}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Shortcuts Card based on User Roles */}
          <Card className="shadow-sm border rounded-2xl">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-800">
                Accesos y Tareas de tu Rol
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5">
              {checkRole(['RECEPCION', 'ADMIN']) && (
                <Link href="/dashboard/recepcion" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 flex items-center justify-between rounded-xl">
                    <span className="flex items-center gap-2"><Anchor className="h-4 w-4" /> Registrar Nueva Recepción</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}

              {checkRole(['CALIDAD', 'QA', 'ADMIN']) && (
                <Link href="/dashboard/clasificacion" className="block">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 flex items-center justify-between rounded-xl">
                    <span className="flex items-center gap-2"><Clipboard className="h-4 w-4" /> Evaluar Calidad y Clasificación</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}

              {checkRole(['PRODUCCION', 'ADMIN']) && (
                <Link href="/dashboard/procesamiento" className="block">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2 flex items-center justify-between rounded-xl">
                    <span className="flex items-center gap-2"><Layers className="h-4 w-4" /> Registrar Sala de Cortes</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}

              {checkRole(['PRODUCCION', 'CALIDAD', 'QA', 'ADMIN']) && (
                <Link href="/dashboard/congelamiento" className="block">
                  <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs py-2 flex items-center justify-between rounded-xl">
                    <span className="flex items-center gap-2"><Snowflake className="h-4 w-4" /> Control Túnel / Almacén</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}

              {checkRole(['LOGISTICA', 'ADMIN']) && (
                <Link href="/dashboard/despacho" className="block">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 flex items-center justify-between rounded-xl">
                    <span className="flex items-center gap-2"><Truck className="h-4 w-4" /> Despachar Exportación (SANIPES)</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              )}

              <Link href="/dashboard/auditoria" className="block">
                <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 flex items-center justify-between rounded-xl">
                  <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-slate-500" /> Línea de Tiempo de Auditoría</span>
                  <ArrowRight className="h-3 w-3 text-slate-500" />
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
