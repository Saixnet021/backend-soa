'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { getLotes } from '@/lib/api/lotes'
import type { LotePesca, EstadoSanipes, EstadoCadenaFrio } from '@/types'
import { LOTES_MOCK } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Eye, Plus, Search } from 'lucide-react'

export default function LotesPage() {
  const [lotes, setLotes] = useState<LotePesca[]>(LOTES_MOCK)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroFrio, setFiltroFrio] = useState('')
  const usuario = useAuthStore(s => s.usuario)

  useEffect(() => {
    getLotes().then(setLotes).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = lotes.filter(l => {
    const matchSearch = !search || l.codigoLote.toLowerCase().includes(search.toLowerCase()) || l.especie.toLowerCase().includes(search.toLowerCase())
    const matchEstado = !filtroEstado || l.estadoSanipes === filtroEstado
    const matchFrio = !filtroFrio || l.estadoCadenaFrio === filtroFrio
    return matchSearch && matchEstado && matchFrio
  })

  const badgeFrio = (v: EstadoCadenaFrio) => <Badge variant={v === 'OK' ? 'success' : v === 'ALERTA' ? 'warning' : 'danger'}>{v}</Badge>
  const badgeSanipes = (v: EstadoSanipes) => <Badge variant={v === 'APTO_EXPORTACION' ? 'info' : v === 'APROBADO' ? 'success' : v === 'RECHAZADO' ? 'danger' : 'gray'}>{v}</Badge>

  if (loading) return <Skeleton className="h-96 rounded-lg" />

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex flex-1 gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por código o especie..." className="pl-9" />
          </div>
          <Select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Estado SANIPES</option>
            <option value="PENDIENTE">PENDIENTE</option>
            <option value="APROBADO">APROBADO</option>
            <option value="RECHAZADO">RECHAZADO</option>
            <option value="APTO_EXPORTACION">APTO EXPORTACIÓN</option>
          </Select>
          <Select value={filtroFrio} onChange={e => setFiltroFrio(e.target.value)}>
            <option value="">Cadena Frío</option>
            <option value="OK">OK</option>
            <option value="ALERTA">ALERTA</option>
            <option value="RUPTURA">RUPTURA</option>
          </Select>
        </div>
        {usuario && (usuario.rol === 'ADMIN' || usuario.rol === 'LOGISTICA') && (
          <Link href="/dashboard/lotes/nuevo"><Button><Plus className="h-4 w-4 mr-1" /> Nuevo Lote</Button></Link>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Especie</TableHead>
            <TableHead>Embarcación</TableHead>
            <TableHead>Peso</TableHead>
            <TableHead>Cadena Frío</TableHead>
            <TableHead>SANIPES</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map(l => (
            <TableRow key={l.id}>
              <TableCell className="font-medium">{l.codigoLote}</TableCell>
              <TableCell>{l.especie}</TableCell>
              <TableCell>{l.nombreEmbarcacion}</TableCell>
              <TableCell>{l.pesoKg} kg</TableCell>
              <TableCell>{badgeFrio(l.estadoCadenaFrio)}</TableCell>
              <TableCell>{badgeSanipes(l.estadoSanipes)}</TableCell>
              <TableCell>
                <Link href={`/dashboard/lotes/${l.id}`}>
                  <Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-1" /> Ver</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No se encontraron lotes</TableCell></TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
