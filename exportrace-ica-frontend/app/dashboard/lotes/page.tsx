'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { getLotes, getEspecies, crearLote } from '@/lib/api/lotes'
import type { LotePesca, EstadoSanipes, EstadoCadenaFrio, Especie } from '@/types'
import { LOTES_MOCK, ESPECIES_MOCK } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Eye, Plus, Search, X } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const schema = z.object({
  codigoLote: z.string().min(1, 'Código requerido').regex(/^LOT-\d{4}-\d{3,}$/, 'Formato: LOT-YYYY-NNN'),
  especie: z.string().min(1, 'Selecciona una especie'),
  nombreEmbarcacion: z.string().min(1, 'Embarcación requerida'),
  matriculaEmbarcacion: z.string().min(1, 'Matrícula requerida'),
  capitanEmbarcacion: z.string().min(1, 'Capitán requerido'),
  empresaRazonSocial: z.string().min(1, 'Razón social requerida'),
  empresaRuc: z.string().min(11, 'RUC requerido').max(11, 'El RUC debe tener 11 dígitos'),
  pesoKg: z.coerce.number().positive('Debe ser > 0'),
  fechaRecepcion: z.string().min(1, 'Fecha requerida'),
})

type FormData = z.infer<typeof schema>

export default function LotesPage() {
  const [lotes, setLotes] = useState<LotePesca[]>(LOTES_MOCK)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroFrio, setFiltroFrio] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [especies, setEspecies] = useState<Especie[]>(ESPECIES_MOCK)
  const [especieSeleccionada, setEspecieSeleccionada] = useState<Especie | null>(null)
  const usuario = useAuthStore(s => s.usuario)

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fechaRecepcion: new Date().toISOString().slice(0, 16) }
  })

  const especieWatch = watch('especie')

  useEffect(() => {
    getLotes().then(setLotes).catch(() => {}).finally(() => setLoading(false))
    getEspecies().then(setEspecies).catch(() => {})
  }, [])

  useEffect(() => {
    const esp = especies.find(e => e.nombreComun === especieWatch)
    setEspecieSeleccionada(esp || null)
  }, [especieWatch, especies])

  const filtered = lotes.filter(l => {
    const searchText = search.toLowerCase()
    const matchSearch = !search || l.codigoLote.toLowerCase().includes(searchText) || l.especie.toLowerCase().includes(searchText) || l.nombreEmbarcacion.toLowerCase().includes(searchText) || (l.empresaRazonSocial || '').toLowerCase().includes(searchText) || (l.empresaRuc || '').toLowerCase().includes(searchText)
    const matchEstado = !filtroEstado || l.estadoSanipes === filtroEstado
    const matchFrio = !filtroFrio || l.estadoCadenaFrio === filtroFrio
    return matchSearch && matchEstado && matchFrio
  })

  const badgeFrio = (v: EstadoCadenaFrio) => <Badge variant={v === 'OK' ? 'success' : v === 'ALERTA' ? 'warning' : 'danger'}>{v}</Badge>
  const badgeSanipes = (v: EstadoSanipes) => <Badge variant={v === 'APTO_EXPORTACION' ? 'info' : v === 'APROBADO' ? 'success' : v === 'RECHAZADO' ? 'danger' : 'gray'}>{v}</Badge>

  const abrirModal = () => {
    reset({ fechaRecepcion: new Date().toISOString().slice(0, 16) })
    setShowModal(true)
  }

  const onSubmit = async (data: FormData) => {
    if (especieSeleccionada?.enVeda) {
      toast.error(`La especie ${data.especie} está en veda. No se puede crear el lote.`)
      return
    }
    try {
      await crearLote({ ...data, fechaRecepcion: data.fechaRecepcion } as any)
      toast.success('Lote creado exitosamente')
      setShowModal(false)
      setLoading(true)
      getLotes().then(setLotes).catch(() => {}).finally(() => setLoading(false))
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear lote')
    }
  }

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
          <Button onClick={abrirModal}><Plus className="h-4 w-4 mr-1" /> Nuevo Lote</Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Código</TableHead>
            <TableHead>Especie</TableHead>
            <TableHead>Embarcación y Empresa</TableHead>
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
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{l.nombreEmbarcacion}</span>
                  <span className="text-xs text-muted-foreground">{l.empresaRazonSocial || 'Empresa no registrada'}</span>
                  <span className="text-xs text-muted-foreground">RUC: {l.empresaRuc || '—'} | Matrícula: {l.matriculaEmbarcacion || '—'}</span>
                </div>
              </TableCell>
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

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Nuevo Lote</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Código de Lote</label>
                <Input {...register('codigoLote')} placeholder="LOT-2026-010" />
                {errors.codigoLote && <p className="text-xs text-danger mt-1">{errors.codigoLote.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Especie</label>
                <Select {...register('especie')}>
                  <option value="">Seleccionar especie...</option>
                  {especies.map(e => (
                    <option key={e.id} value={e.nombreComun} disabled={e.enVeda}>
                      {e.nombreComun} {e.enVeda ? '(EN VEDA)' : `(${e.codigoSanipes})`}
                    </option>
                  ))}
                </Select>
                {errors.especie && <p className="text-xs text-danger mt-1">{errors.especie.message}</p>}
                {especieSeleccionada?.enVeda && <p className="text-xs text-danger mt-1">Esta especie está en veda — no se permite el registro de nuevos lotes</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Embarcación</label>
                <Input {...register('nombreEmbarcacion')} placeholder="Nombre de la embarcación" />
                {errors.nombreEmbarcacion && <p className="text-xs text-danger mt-1">{errors.nombreEmbarcacion.message}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Matrícula de embarcación</label>
                  <Input {...register('matriculaEmbarcacion')} placeholder="Ej: PIS-0142" />
                  {errors.matriculaEmbarcacion && <p className="text-xs text-danger mt-1">{errors.matriculaEmbarcacion.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">Capitán</label>
                  <Input {...register('capitanEmbarcacion')} placeholder="Nombre del capitán" />
                  {errors.capitanEmbarcacion && <p className="text-xs text-danger mt-1">{errors.capitanEmbarcacion.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Razón social de la empresa</label>
                  <Input {...register('empresaRazonSocial')} placeholder="Pesquera Ejemplo S.A.C." />
                  {errors.empresaRazonSocial && <p className="text-xs text-danger mt-1">{errors.empresaRazonSocial.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium">RUC de la empresa</label>
                  <Input {...register('empresaRuc')} placeholder="20512345678" />
                  {errors.empresaRuc && <p className="text-xs text-danger mt-1">{errors.empresaRuc.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Peso (kg)</label>
                <Input type="number" step="0.1" {...register('pesoKg')} placeholder="Ej: 1500" />
                {errors.pesoKg && <p className="text-xs text-danger mt-1">{errors.pesoKg.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Fecha de Recepción</label>
                <Input type="datetime-local" {...register('fechaRecepcion')} />
                {errors.fechaRecepcion && <p className="text-xs text-danger mt-1">{errors.fechaRecepcion.message}</p>}
              </div>
              <Button type="submit" className="w-full bg-slate-800 hover:bg-slate-950 text-white font-semibold rounded-md" disabled={isSubmitting}>
                {isSubmitting ? 'Creando...' : 'Crear Lote'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
