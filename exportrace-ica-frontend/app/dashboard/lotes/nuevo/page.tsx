'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getEspecies, crearLote } from '@/lib/api/lotes'
import type { Especie } from '@/types'
import { ESPECIES_MOCK } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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

export default function NuevoLotePage() {
  const router = useRouter()
  const [especies, setEspecies] = useState<Especie[]>(ESPECIES_MOCK)
  const [especieSeleccionada, setEspecieSeleccionada] = useState<Especie | null>(null)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { fechaRecepcion: new Date().toISOString().slice(0, 16) }
  })

  const especieWatch = watch('especie')

  useEffect(() => {
    getEspecies().then(setEspecies).catch(() => {})
  }, [])

  useEffect(() => {
    const esp = especies.find(e => e.nombreComun === especieWatch)
    setEspecieSeleccionada(esp || null)
  }, [especieWatch, especies])

  const onSubmit = async (data: FormData) => {
    if (especieSeleccionada?.enVeda) {
      toast.error(`La especie ${data.especie} está en veda. No se puede crear el lote.`)
      return
    }
    try {
      await crearLote({ ...data, fechaRecepcion: data.fechaRecepcion } as any)
      toast.success('Lote creado exitosamente')
      router.push('/dashboard/lotes')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al crear lote')
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/dashboard/lotes" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Volver a lotes
      </Link>
      <Card>
        <CardHeader><CardTitle>Nuevo Lote</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  )
}
