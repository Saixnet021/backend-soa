'use client'
import { useState, useEffect } from 'react'
import { getEspecies, actualizarVedaEspecie } from '@/lib/api/lotes'
import type { Especie } from '@/types'
import { ESPECIES_MOCK } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Info } from 'lucide-react'

export default function EspeciesPage() {
  const [especies, setEspecies] = useState<Especie[]>(ESPECIES_MOCK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getEspecies().then(setEspecies).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const toggleVeda = async (esp: Especie) => {
    try {
      const updated = await actualizarVedaEspecie(esp.id, !esp.enVeda)
      setEspecies(prev => prev.map(e => e.id === updated.id ? { ...e, enVeda: updated.enVeda } : e))
      toast.success(`${esp.nombreComun} ${updated.enVeda ? 'puesta' : 'quitada'} en veda`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al actualizar veda')
    }
  }

  if (loading) return <Skeleton className="h-96 rounded-lg" />

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestión de Especies</CardTitle>
            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-slate-50 px-3 py-1 rounded">
              <Info className="h-3 w-3" /> Las especies en veda no pueden recibir nuevos lotes
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código SANIPES</TableHead>
                <TableHead>Nombre Común</TableHead>
                <TableHead>Nombre Científico</TableHead>
                <TableHead>Temp Mín</TableHead>
                <TableHead>Temp Máx</TableHead>
                <TableHead>Veda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {especies.map(e => (
                <TableRow key={e.id} className={e.enVeda ? 'bg-red-50' : ''}>
                  <TableCell className="font-medium">{e.codigoSanipes}</TableCell>
                  <TableCell>{e.nombreComun}</TableCell>
                  <TableCell className="text-sm text-muted-foreground italic">{e.nombreCientifico}</TableCell>
                  <TableCell>{e.tempMinCelsius}°C</TableCell>
                  <TableCell>{e.tempMaxCelsius}°C</TableCell>
                  <TableCell>
                    <button
                      onClick={() => toggleVeda(e)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${e.enVeda ? 'bg-danger' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${e.enVeda ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="ml-2 text-xs">{e.enVeda ? 'EN VEDA' : 'Activa'}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
