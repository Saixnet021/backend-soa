'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getClasificaciones, getProcesamientos, registrarProcesamiento, ClasificacionResponse, ProcesamientoResponse } from '@/lib/api/trazabilidad'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Layers, ShieldAlert } from 'lucide-react'
import { formatEstado } from '@/lib/utils'

export default function ProcesamientoPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const checkRole = (roles: string[]) => usuario && roles.includes(usuario.rol)

  const [clasificaciones, setClasificaciones] = useState<ClasificacionResponse[]>([])
  const [procesamientos, setProcesamientos] = useState<ProcesamientoResponse[]>([])
  const [loading, setLoading] = useState(true)

  const [formProcesamiento, setFormProcesamiento] = useState({
    loteOrigenId: 0,
    tipoCorte: 'FILETE' as 'FILETE' | 'ANILLAS' | 'ENTERO',
    tratamientoQuimico: 'NATURAL' as 'NATURAL' | 'ADITIVO',
    tipoEmpaque: 'CAJA_MASTER_10KG' as 'CAJA_MASTER_10KG' | 'SACO_20KG',
    cantidadBultosCajas: 0,
    pesoNetoFinal: 0,
    lineaProceso: ''
  })

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [classifs, procs] = await Promise.all([
        getClasificaciones(true),
        getProcesamientos()
      ])
      setClasificaciones(classifs)
      setProcesamientos(procs)
    } catch (err: any) {
      toast.error('Error al cargar datos de procesamiento')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const submitProcesamiento = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formProcesamiento.loteOrigenId === 0) {
      toast.warning('Debe seleccionar una clasificación de origen')
      return
    }
    try {
      await registrarProcesamiento(formProcesamiento)
      toast.success('Procesamiento registrado exitosamente')
      cargarDatos()
      setFormProcesamiento({
        loteOrigenId: 0,
        tipoCorte: 'FILETE',
        tratamientoQuimico: 'NATURAL',
        tipoEmpaque: 'CAJA_MASTER_10KG',
        cantidadBultosCajas: 0,
        pesoNetoFinal: 0,
        lineaProceso: ''
      })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar procesamiento')
    }
  }

  if (loading) return <Skeleton className="h-96 rounded-lg animate-pulse" />

  return (
    <div className="space-y-6 bg-white border rounded-2xl shadow-sm p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Layers className="text-indigo-600 h-5 w-5" /> Procesamiento (Sala de Cortes)
        </h2>
        {checkRole(['PRODUCCION', 'ADMIN']) ? (
          <form onSubmit={submitProcesamiento} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border">
            <div>
              <label className="text-xs font-semibold text-slate-600">Lote de Origen (Calidad Aprobado/Observado)</label>
              <Select
                value={formProcesamiento.loteOrigenId}
                onChange={(e) => setFormProcesamiento({ ...formProcesamiento, loteOrigenId: parseInt(e.target.value) || 0 })}
              >
                <option value="0">Seleccionar clasificación...</option>
                {clasificaciones
                  .filter((c) => c.estado !== 'RECHAZADO_TOTAL')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      Clasificación #{c.id} ({c.loteOrigen.especie} - Útil: {c.pesoUtil} kg)
                    </option>
                  ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Tipo de Corte</label>
              <Select
                value={formProcesamiento.tipoCorte}
                onChange={(e) => setFormProcesamiento({ ...formProcesamiento, tipoCorte: e.target.value as any })}
              >
                <option value="FILETE">Filete</option>
                <option value="ANILLAS">Anillas</option>
                <option value="ENTERO">Entero</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Tratamiento Químico</label>
              <Select
                value={formProcesamiento.tratamientoQuimico}
                onChange={(e) => setFormProcesamiento({ ...formProcesamiento, tratamientoQuimico: e.target.value as any })}
              >
                <option value="NATURAL">Natural (Sin Aditivos)</option>
                <option value="ADITIVO">Aditivo Permitido</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Tipo de Empaque</label>
              <Select
                value={formProcesamiento.tipoEmpaque}
                onChange={(e) => setFormProcesamiento({ ...formProcesamiento, tipoEmpaque: e.target.value as any })}
              >
                <option value="CAJA_MASTER_10KG">Caja Master 10 Kg</option>
                <option value="SACO_20KG">Saco de Polietileno 20 Kg</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Cantidad de Bultos/Cajas</label>
              <Input
                type="number"
                required
                value={formProcesamiento.cantidadBultosCajas || ''}
                onChange={(e) => setFormProcesamiento({ ...formProcesamiento, cantidadBultosCajas: parseInt(e.target.value) || 0 })}
                placeholder="Ej: 120"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Peso Neto Final (Kg)</label>
              <Input
                type="number"
                step="0.01"
                required
                value={formProcesamiento.pesoNetoFinal || ''}
                onChange={(e) => setFormProcesamiento({ ...formProcesamiento, pesoNetoFinal: parseFloat(e.target.value) || 0 })}
                placeholder="Ej: 1195.5"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600">Línea de Proceso</label>
              <Input
                required
                value={formProcesamiento.lineaProceso}
                onChange={(e) => setFormProcesamiento({ ...formProcesamiento, lineaProceso: e.target.value })}
                placeholder="Ej: Línea 01 - Cortes Especiales Pota"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <Button type="submit" className="bg-indigo-950 text-white font-semibold">
                <Layers className="h-4 w-4 mr-1.5" /> Registrar en Producción
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div>
              <strong>Acceso Restringido:</strong> Solo usuarios con rol <strong>PRODUCCION</strong> o <strong>ADMIN</strong> pueden ingresar en sala de cortes.
            </div>
          </div>
        )}

        <h3 className="font-bold text-slate-700 text-sm mt-6">Lotes Procesados</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lote Producción ID</TableHead>
              <TableHead>Clasificación Origen</TableHead>
              <TableHead>Corte / Aditivo</TableHead>
              <TableHead>Empaque / Bultos</TableHead>
              <TableHead>Peso Neto Final</TableHead>
              <TableHead>Rendimiento</TableHead>
              <TableHead>Supervisor</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {procesamientos.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-bold text-indigo-950 text-xs">{p.idLoteProduccion}</TableCell>
                <TableCell>Calificación #{p.loteOrigen.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs">
                    <span>Corte: {p.tipoCorte}</span>
                    <span className="text-slate-500">{p.tratamientoQuimico}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs">
                    <span>{p.tipoEmpaque}</span>
                    <span className="font-semibold">{p.cantidadBultosCajas} Cajas/Sacos</span>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-slate-800">{p.pesoNetoFinal} kg</TableCell>
                <TableCell>
                  <Badge variant={p.porcentajeRendimiento < 60 ? 'warning' : 'success'}>
                    {p.porcentajeRendimiento} %
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{p.nombreSupervisor}</TableCell>
                <TableCell>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${p.colorHex}20`, color: p.colorHex }}
                  >
                    {formatEstado(p.estado)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {procesamientos.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                  No hay lotes procesados registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
