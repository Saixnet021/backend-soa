'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getRecepciones, registrarRecepcion, RecepcionResponse } from '@/lib/api/trazabilidad'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Anchor, ShieldAlert } from 'lucide-react'
import { formatEstado } from '@/lib/utils'

export default function RecepcionPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const checkRole = (roles: string[]) => usuario && roles.includes(usuario.rol)

  const [recepciones, setRecepciones] = useState<RecepcionResponse[]>([])
  const [loading, setLoading] = useState(true)

  const [formRecepcion, setFormRecepcion] = useState({
    numeroDER: '',
    nombreEmbarcacion: '',
    matriculaEmbarcacion: '',
    especie: 'POTA' as 'POTA' | 'PERICO',
    pesoBrutoBascula: 0,
    temperaturaLlegada: 0,
    guiaRemisionRemitente: '',
    turno: 'MAÑANA' as 'MAÑANA' | 'TARDE' | 'NOCHE'
  })

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const recs = await getRecepciones()
      setRecepciones(recs)
    } catch (err: any) {
      toast.error('Error al cargar recepciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const submitRecepcion = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await registrarRecepcion(formRecepcion)
      toast.success('Recepción registrada exitosamente')
      cargarDatos()
      setFormRecepcion({
        numeroDER: '',
        nombreEmbarcacion: '',
        matriculaEmbarcacion: '',
        especie: 'POTA',
        pesoBrutoBascula: 0,
        temperaturaLlegada: 0,
        guiaRemisionRemitente: '',
        turno: 'MAÑANA'
      })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar recepción')
    }
  }

  if (loading) return <Skeleton className="h-96 rounded-lg animate-pulse" />

  return (
    <div className="space-y-6 bg-white border rounded-2xl shadow-sm p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Anchor className="text-indigo-600 h-5 w-5" /> Recepción y Descarga (Muelle)
        </h2>
        {checkRole(['RECEPCION', 'ADMIN']) ? (
          <form onSubmit={submitRecepcion} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border">
            <div>
              <label className="text-xs font-semibold text-slate-600">Número DER</label>
              <Input
                required
                value={formRecepcion.numeroDER}
                onChange={(e) => setFormRecepcion({ ...formRecepcion, numeroDER: e.target.value })}
                placeholder="Ej: DER-2026-1025"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Nombre Embarcación</label>
              <Input
                required
                value={formRecepcion.nombreEmbarcacion}
                onChange={(e) => setFormRecepcion({ ...formRecepcion, nombreEmbarcacion: e.target.value })}
                placeholder="Ej: Mi San Martín"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Matrícula</label>
              <Input
                required
                value={formRecepcion.matriculaEmbarcacion}
                onChange={(e) => setFormRecepcion({ ...formRecepcion, matriculaEmbarcacion: e.target.value })}
                placeholder="Ej: CO-10254-PM"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Especie</label>
              <Select
                value={formRecepcion.especie}
                onChange={(e) => setFormRecepcion({ ...formRecepcion, especie: e.target.value as any })}
              >
                <option value="POTA">Pota (Dosidicus gigas)</option>
                <option value="PERICO">Perico (Coryphaena hippurus)</option>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Peso Bruto Báscula (Kg)</label>
              <Input
                type="number"
                step="0.01"
                required
                value={formRecepcion.pesoBrutoBascula || ''}
                onChange={(e) => setFormRecepcion({ ...formRecepcion, pesoBrutoBascula: parseFloat(e.target.value) || 0 })}
                placeholder="Ej: 2450.5"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Temperatura Llegada (°C)</label>
              <Input
                type="number"
                step="0.1"
                required
                value={formRecepcion.temperaturaLlegada || ''}
                onChange={(e) => setFormRecepcion({ ...formRecepcion, temperaturaLlegada: parseFloat(e.target.value) || 0 })}
                placeholder="Ej: 4.2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Guía de Remisión Remitente</label>
              <Input
                required
                value={formRecepcion.guiaRemisionRemitente}
                onChange={(e) => setFormRecepcion({ ...formRecepcion, guiaRemisionRemitente: e.target.value })}
                placeholder="Ej: T-002-1425"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Turno</label>
              <Select
                value={formRecepcion.turno}
                onChange={(e) => setFormRecepcion({ ...formRecepcion, turno: e.target.value as any })}
              >
                <option value="MAÑANA">Mañana</option>
                <option value="TARDE">Tarde</option>
                <option value="NOCHE">Noche</option>
              </Select>
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <Button type="submit" className="bg-indigo-950 text-white font-semibold">
                <Anchor className="h-4 w-4 mr-1.5" /> Registrar Recepción
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div>
              <strong>Acceso Restringido:</strong> Solo usuarios con rol <strong>RECEPCION</strong> o <strong>ADMIN</strong> pueden ingresar nuevas recepciones.
            </div>
          </div>
        )}

        <h3 className="font-bold text-slate-700 text-sm mt-6">Historial de Recepciones en Muelle</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>N° DER / Guía</TableHead>
              <TableHead>Embarcación & Matrícula</TableHead>
              <TableHead>Especie</TableHead>
              <TableHead>Peso Bruto</TableHead>
              <TableHead>Temperatura</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recepciones.map((r) => (
              <TableRow key={r.idTicket}>
                <TableCell className="font-semibold text-indigo-950"># {r.idTicket}</TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs">
                    <span className="font-medium text-slate-800">{r.numeroDER}</span>
                    <span className="text-slate-500">Guía: {r.guiaRemisionRemitente}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-xs">
                    <span className="font-semibold text-slate-800">{r.nombreEmbarcacion}</span>
                    <span className="text-slate-500">Matrícula: {r.matriculaEmbarcacion}</span>
                  </div>
                </TableCell>
                <TableCell>{r.especie}</TableCell>
                <TableCell>{r.pesoBrutoBascula} kg</TableCell>
                <TableCell>
                  <Badge variant={r.temperaturaLlegada > 5 ? 'danger' : 'success'}>
                    {r.temperaturaLlegada} °C
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{r.nombreResponsable}</TableCell>
                <TableCell>
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${r.colorHex}20`, color: r.colorHex }}
                  >
                    {formatEstado(r.estado)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {recepciones.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-500 py-8">
                  No hay recepciones registradas en muelle.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
