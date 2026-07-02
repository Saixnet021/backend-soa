'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getLotes } from '@/lib/api/lotes'
import { getTramitesPorLote } from '@/lib/api/certificaciones'
import type { LotePesca, TramiteSanipes } from '@/types'
import { LOTES_MOCK } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Eye, FileCheck } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function CertificacionesPage() {
  const [lotes, setLotes] = useState<LotePesca[]>(LOTES_MOCK)
  const [tramites, setTramites] = useState<Record<number, TramiteSanipes[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLotes().then(async (lts) => {
      setLotes(lts)
      const tmap: Record<number, TramiteSanipes[]> = {}
      for (const l of lts) {
        const ts = await getTramitesPorLote(l.id).catch(() => [])
        if (ts.length > 0) tmap[l.id] = ts
      }
      setTramites(tmap)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton className="h-96 rounded-lg" />

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código Lote</TableHead>
            <TableHead>Especie</TableHead>
            <TableHead>Peso</TableHead>
            <TableHead>Estado SANIPES</TableHead>
            <TableHead>N° Certificado</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lotes.map(l => {
            const t = tramites[l.id]
            const ultimo = t?.[t.length - 1]
            return (
              <TableRow key={l.id}>
                <TableCell className="font-medium">{l.codigoLote}</TableCell>
                <TableCell>{l.especie}</TableCell>
                <TableCell>{l.pesoKg} kg</TableCell>
                <TableCell><Badge variant={l.estadoSanipes === 'APROBADO' ? 'success' : 'gray'}>{l.estadoSanipes}</Badge></TableCell>
                <TableCell>{ultimo?.numeroCertificado || '—'}</TableCell>
                <TableCell>{ultimo?.fechaAprobacion ? formatDate(ultimo.fechaAprobacion) : '—'}</TableCell>
                <TableCell>
                  <Link href={`/dashboard/certificaciones/${l.id}`}>
                    <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> Ver Expediente</Button>
                  </Link>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
