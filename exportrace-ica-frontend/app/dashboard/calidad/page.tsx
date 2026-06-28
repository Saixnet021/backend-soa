'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getTemperaturasPorLote } from '@/lib/api/calidad'
import { useAuthStore } from '@/store/authStore'
import type { AuditoriaCalidad } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Thermometer, Search } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { ESPECIES_MOCK } from '@/types'

export default function CalidadPage() {
  const [idLote, setIdLote] = useState('')
  const [data, setData] = useState<AuditoriaCalidad[]>([])
  const [loading, setLoading] = useState(false)
  const usuario = useAuthStore(s => s.usuario)

  const buscar = async () => {
    if (!idLote) return
    setLoading(true)
    const temps = await getTemperaturasPorLote(Number(idLote)).catch(() => [])
    setData(temps)
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex gap-2">
          <Input value={idLote} onChange={e => setIdLote(e.target.value)} placeholder="ID de Lote..." type="number" className="w-40" />
          <Button onClick={buscar} variant="outline"><Search className="h-4 w-4 mr-1" /> Buscar</Button>
        </div>
        {usuario && (usuario.rol === 'QA' || usuario.rol === 'ADMIN') && (
          <Link href="/dashboard/calidad/registrar"><Button><Plus className="h-4 w-4 mr-1" /> Registrar Temperatura</Button></Link>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lote</TableHead>
            <TableHead>Cámara</TableHead>
            <TableHead>Temperatura</TableHead>
            <TableHead>Inspector</TableHead>
            <TableHead>Fecha/Hora</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(t => {
            const fuera = t.temperaturaCelsius < -18 || t.temperaturaCelsius > -14
            return (
              <TableRow key={t.id}>
                <TableCell>{t.idLote}</TableCell>
                <TableCell>{t.idCamara}</TableCell>
                <TableCell className={fuera ? 'text-danger font-medium' : ''}>
                  {fuera && <Thermometer className="h-4 w-4 inline mr-1 text-danger" />}
                  {t.temperaturaCelsius}°C
                </TableCell>
                <TableCell>{t.idInspector}</TableCell>
                <TableCell>{formatDateTime(t.timestampMedicion)}</TableCell>
              </TableRow>
            )
          })}
          {data.length === 0 && !loading && (
            <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">
              <Thermometer className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Ingresa un ID de lote y presiona Buscar
            </TableCell></TableRow>
          )}
          {loading && <TableRow><TableCell colSpan={5}><Skeleton className="h-8" /></TableCell></TableRow>}
        </TableBody>
      </Table>
    </div>
  )
}
