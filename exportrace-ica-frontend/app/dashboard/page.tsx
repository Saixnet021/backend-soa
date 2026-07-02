'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Eye, Fish, Thermometer, FileCheck, AlertTriangle } from 'lucide-react'
import { getLotes } from '@/lib/api/lotes'
import { useNotificacionesStore } from '@/store/notificacionesStore'
import type { LotePesca } from '@/types'
import { LOTES_MOCK } from '@/types'

export default function DashboardPage() {
  const [lotes, setLotes] = useState<LotePesca[]>(LOTES_MOCK)
  const [loading, setLoading] = useState(true)
  const setAlertasCount = useNotificacionesStore(s => s.setAlertasCount)

  useEffect(() => {
    getLotes().then(data => {
      setLotes(data)
      setAlertasCount(data.filter(l => l.estadoCadenaFrio !== 'OK').length)
    }).catch(() => {
      setAlertasCount(LOTES_MOCK.filter(l => l.estadoCadenaFrio !== 'OK').length)
    }).finally(() => setLoading(false))
  }, [])

  const totalLotes = lotes.length
  const aptos = lotes.filter(l => l.estadoSanipes === 'APROBADO' || l.estadoSanipes === 'APTO_EXPORTACION').length
  const alertas = lotes.filter(l => l.estadoCadenaFrio !== 'OK').length
  const recientes = [...lotes].sort((a, b) => new Date(b.fechaRecepcion).getTime() - new Date(a.fechaRecepcion).getTime()).slice(0, 5)
  const alertasActivas = lotes.filter(l => l.estadoCadenaFrio === 'ALERTA' || l.estadoCadenaFrio === 'RUPTURA')

  const stats = [
    { label: 'Lotes Totales', value: totalLotes, icon: Fish, color: 'text-primary' },
    { label: 'Aptos Exportación', value: aptos, icon: FileCheck, color: 'text-success' },
    { label: 'Alertas Frío', value: alertas, icon: Thermometer, color: alertas > 0 ? 'text-danger' : 'text-success' },
    { label: 'Pendientes SANIPES', value: lotes.filter(l => l.estadoSanipes === 'PENDIENTE').length, icon: AlertTriangle, color: 'text-warning' },
  ]

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-full p-2 bg-slate-100 ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Lotes Recientes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Frío</TableHead>
                  <TableHead>SANIPES</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recientes.map(l => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.codigoLote}</TableCell>
                    <TableCell>{l.especie}</TableCell>
                    <TableCell>{l.pesoKg} kg</TableCell>
                    <TableCell>
                      <Badge variant={l.estadoCadenaFrio === 'OK' ? 'success' : l.estadoCadenaFrio === 'ALERTA' ? 'warning' : 'danger'}>{l.estadoCadenaFrio}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={l.estadoSanipes === 'APROBADO' || l.estadoSanipes === 'APTO_EXPORTACION' ? 'success' : l.estadoSanipes === 'RECHAZADO' ? 'danger' : 'gray'}>{l.estadoSanipes}</Badge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/lotes/${l.id}`}>
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Alertas Activas</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {alertasActivas.length === 0 && <p className="text-sm text-muted-foreground">No hay alertas activas</p>}
            {alertasActivas.map(l => (
              <div key={l.id} className={`p-3 rounded-lg border ${l.estadoCadenaFrio === 'RUPTURA' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{l.codigoLote}</span>
                  <Badge variant={l.estadoCadenaFrio === 'RUPTURA' ? 'danger' : 'warning'}>{l.estadoCadenaFrio}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{l.especie} — {l.nombreEmbarcacion}</p>
                <p className="text-[11px] text-muted-foreground">{l.empresaRazonSocial || 'Empresa no registrada'} · RUC {l.empresaRuc || '—'}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
