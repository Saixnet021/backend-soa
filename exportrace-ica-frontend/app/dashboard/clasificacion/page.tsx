'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getRecepciones, getClasificaciones, registrarClasificacion, RecepcionResponse, ClasificacionResponse } from '@/lib/api/trazabilidad'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Clipboard, ShieldAlert } from 'lucide-react'
import { formatEstado } from '@/lib/utils'

export default function ClasificacionPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const checkRole = (roles: string[]) => usuario && roles.includes(usuario.rol)

  const [recepciones, setRecepciones] = useState<RecepcionResponse[]>([])
  const [clasificaciones, setClasificaciones] = useState<ClasificacionResponse[]>([])
  const [loading, setLoading] = useState(true)

  const [formClasificacion, setFormClasificacion] = useState({
    loteOrigenId: 0,
    evaluacionSensorial: 'FIRME' as 'FIRME' | 'OLOR_CARACTERISTICO' | 'COLOR_NORMAL',
    calibreTalla: 'M' as 'S' | 'M' | 'L' | 'XL' | 'MIXTO',
    kilosMermaDescarte: 0,
    motivoRechazo: '',
    firmaQA: '',
    estado: 'APROBADO_CORTE' as 'APROBADO_CORTE' | 'OBSERVADO' | 'RECHAZADO_TOTAL'
  })

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const [recs, classifs] = await Promise.all([
        getRecepciones(),
        getClasificaciones(true)
      ])
      setRecepciones(recs)
      setClasificaciones(classifs)
    } catch (err: any) {
      toast.error('Error al cargar datos de clasificación')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const submitClasificacion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formClasificacion.loteOrigenId === 0) {
      toast.warning('Debe seleccionar un lote de origen')
      return
    }
    try {
      await registrarClasificacion(formClasificacion)
      toast.success('Clasificación registrada exitosamente')
      cargarDatos()
      setFormClasificacion({
        loteOrigenId: 0,
        evaluacionSensorial: 'FIRME',
        calibreTalla: 'M',
        kilosMermaDescarte: 0,
        motivoRechazo: '',
        firmaQA: '',
        estado: 'APROBADO_CORTE'
      })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar clasificación')
    }
  }

  if (loading) return <Skeleton className="h-96 rounded-lg animate-pulse" />

  return (
    <div className="space-y-6 bg-white border rounded-2xl shadow-sm p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Clipboard className="text-indigo-600 h-5 w-5" /> Clasificación y Selección (Planta Crudos)
        </h2>
        {checkRole(['CALIDAD', 'QA', 'ADMIN']) ? (
          <form onSubmit={submitClasificacion} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border">
            <div>
              <label className="text-xs font-semibold text-slate-600">Lote Origen (Recepción PENDIENTE)</label>
              <Select
                value={formClasificacion.loteOrigenId}
                onChange={(e) => setFormClasificacion({ ...formClasificacion, loteOrigenId: parseInt(e.target.value) || 0 })}
              >
                <option value="0">Seleccionar ticket...</option>
                {recepciones
                  .filter((r) => r.estado === 'PENDIENTE_QA')
                  .map((r) => (
                    <option key={r.idTicket} value={r.idTicket}>
                      #{r.idTicket} - {r.nombreEmbarcacion} ({r.especie} - {r.pesoBrutoBascula} kg)
                    </option>
                  ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Evaluación Sensorial</label>
              <Select
                value={formClasificacion.evaluacionSensorial}
                onChange={(e) => setFormClasificacion({ ...formClasificacion, evaluacionSensorial: e.target.value as any })}
              >
                <option value="FIRME">Firme (Fresco)</option>
                <option value="OLOR_CARACTERISTICO">Olor Característico</option>
                <option value="COLOR_NORMAL">Color Normal</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Talla / Calibre</label>
              <Select
                value={formClasificacion.calibreTalla}
                onChange={(e) => setFormClasificacion({ ...formClasificacion, calibreTalla: e.target.value as any })}
              >
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="MIXTO">Mixto</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Mermas / Descartes (Kg)</label>
              <Input
                type="number"
                step="0.01"
                required
                value={formClasificacion.kilosMermaDescarte || ''}
                onChange={(e) => setFormClasificacion({ ...formClasificacion, kilosMermaDescarte: parseFloat(e.target.value) || 0 })}
                placeholder="Ej: 45.8"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Firma Inspector QA (Digital/Texto)</label>
              <Input
                required
                value={formClasificacion.firmaQA}
                onChange={(e) => setFormClasificacion({ ...formClasificacion, firmaQA: e.target.value })}
                placeholder="Ej: ING. M. SALINAS"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Resultado Evaluación</label>
              <Select
                value={formClasificacion.estado}
                onChange={(e) => setFormClasificacion({ ...formClasificacion, estado: e.target.value as any })}
              >
                <option value="APROBADO_CORTE">Aprobado para Corte</option>
                <option value="OBSERVADO">Observado (Reprocesar)</option>
                <option value="RECHAZADO_TOTAL">Rechazado Total</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600">Motivo Rechazo (Opcional)</label>
              <Input
                value={formClasificacion.motivoRechazo}
                onChange={(e) => setFormClasificacion({ ...formClasificacion, motivoRechazo: e.target.value })}
                placeholder="Detallar solo en caso de Rechazado/Observado"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <Button type="submit" className="bg-indigo-950 text-white font-semibold">
                <Clipboard className="h-4 w-4 mr-1.5" /> Registrar Clasificación
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div>
              <strong>Acceso Restringido:</strong> Solo usuarios con rol <strong>CALIDAD</strong> o <strong>ADMIN</strong> pueden clasificar lotes.
            </div>
          </div>
        )}

        <h3 className="font-bold text-slate-700 text-sm mt-6">Inspecciones de Calidad Realizadas</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lote ID</TableHead>
              <TableHead>Ticket Origen</TableHead>
              <TableHead>Evaluación / Talla</TableHead>
              <TableHead>Peso Útil</TableHead>
              <TableHead>Descarte/Merma</TableHead>
              <TableHead>Inspector QA</TableHead>
              <TableHead>Firma QA</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clasificaciones.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-semibold text-indigo-950"># {c.id}</TableCell>
                <TableCell>Ticket #{c.loteOrigen.idTicket} ({c.loteOrigen.nombreEmbarcacion})</TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs">
                    <span>Sensorial: {c.evaluacionSensorial}</span>
                    <span className="font-semibold">Talla: {c.calibreTalla}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-green-700">{c.pesoUtil} kg</TableCell>
                <TableCell>{c.mermaTotal} kg</TableCell>
                <TableCell className="text-xs">{c.nombreInspectorQA}</TableCell>
                <TableCell className="text-xs font-mono">{c.firmaQA}</TableCell>
                <TableCell>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${c.colorHex}20`, color: c.colorHex }}
                  >
                    {formatEstado(c.estado)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {clasificaciones.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                  No hay clasificaciones registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
