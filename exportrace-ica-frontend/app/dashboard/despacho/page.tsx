'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getDisponiblesDespacho, registrarDespacho, consultarRuc, CongelamientoResponse } from '@/lib/api/trazabilidad'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { Truck, ShieldAlert } from 'lucide-react'

export default function DespachoPage() {
  const usuario = useAuthStore((s) => s.usuario)
  const checkRole = (roles: string[]) => usuario && roles.includes(usuario.rol)

  const [disponiblesDespacho, setDisponiblesDespacho] = useState<CongelamientoResponse[]>([])
  const [loading, setLoading] = useState(true)

  const [formDespacho, setFormDespacho] = useState({
    loteId: 0,
    rucCliente: '',
    razonSocialCliente: '',
    puertoDestino: '',
    reservaNaviera: '',
    numeroContenedorFrigorifico: '',
    precintosAduanerosNavieros: '',
    temperaturaSeteoContenedor: -20.0,
    numeroDUS: '',
    codigoCertificadoSanitario: '',
    estado: 'DESPACHADO_EN_TRANSITO' as 'STOCK_DISPONIBLE' | 'DESPACHADO_EN_TRANSITO'
  })

  const [buscandoRuc, setBuscandoRuc] = useState(false)
  const [showRazonSocialManual, setShowRazonSocialManual] = useState(false)
  const [errorRuc, setErrorRuc] = useState('')

  const cargarDatos = async () => {
    setLoading(true)
    try {
      const disps = await getDisponiblesDespacho()
      setDisponiblesDespacho(disps)
    } catch (err: any) {
      toast.error('Error al cargar lotes disponibles para despacho')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  // RUC Lookup watcher
  useEffect(() => {
    if (!formDespacho.rucCliente || formDespacho.rucCliente.length !== 11) {
      setErrorRuc('')
      setShowRazonSocialManual(false)
      return
    }
    if (!/^\d{11}$/.test(formDespacho.rucCliente)) return

    let cancelled = false
    setBuscandoRuc(true)
    setErrorRuc('')
    setShowRazonSocialManual(false)

    consultarRuc(formDespacho.rucCliente)
      .then((data) => {
        if (cancelled) return
        if (data?.razonSocial) {
          setFormDespacho((prev) => ({ ...prev, razonSocialCliente: data.razonSocial }))
          toast.success(`Cliente RUC autocompletado: ${data.razonSocial}`)
        } else {
          setErrorRuc('RUC no encontrado en SUNAT. Ingrese razón social manualmente.')
          setShowRazonSocialManual(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setErrorRuc('Servicio externo de RUC caído / no disponible. Ingrese razón social manualmente.')
          setShowRazonSocialManual(true)
        }
      })
      .finally(() => {
        if (!cancelled) setBuscandoRuc(false)
      })

    return () => {
      cancelled = true
    }
  }, [formDespacho.rucCliente])

  const submitDespacho = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formDespacho.loteId === 0) {
      toast.warning('Debe seleccionar un lote de cámara')
      return
    }
    try {
      await registrarDespacho(formDespacho)
      toast.success('Despacho registrado correctamente')
      cargarDatos()
      setFormDespacho({
        loteId: 0,
        rucCliente: '',
        razonSocialCliente: '',
        puertoDestino: '',
        reservaNaviera: '',
        numeroContenedorFrigorifico: '',
        precintosAduanerosNavieros: '',
        temperaturaSeteoContenedor: -20.0,
        numeroDUS: '',
        codigoCertificadoSanitario: '',
        estado: 'DESPACHADO_EN_TRANSITO'
      })
      setShowRazonSocialManual(false)
      setErrorRuc('')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al registrar despacho')
    }
  }

  if (loading) return <Skeleton className="h-96 rounded-lg animate-pulse" />

  return (
    <div className="space-y-6 bg-white border rounded-2xl shadow-sm p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
          <Truck className="text-indigo-600 h-5 w-5" /> Despacho y Exportación (SANIPES)
        </h2>
        {checkRole(['LOGISTICA', 'ADMIN']) ? (
          <form onSubmit={submitDespacho} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border">
            <div>
              <label className="text-xs font-semibold text-slate-600">Seleccionar Lote de Cámara (FIFO)</label>
              <Select
                value={formDespacho.loteId}
                onChange={(e) => setFormDespacho({ ...formDespacho, loteId: parseInt(e.target.value) || 0 })}
              >
                <option value="0">Seleccionar lote listo...</option>
                {disponiblesDespacho.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.loteOrigen.idLoteProduccion} (Cámara: {c.camaraDestino} - Peso: {c.loteOrigen.pesoNetoFinal} kg)
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">RUC del Cliente</label>
              <div className="relative">
                <Input
                  required
                  maxLength={11}
                  value={formDespacho.rucCliente}
                  onChange={(e) => setFormDespacho({ ...formDespacho, rucCliente: e.target.value })}
                  placeholder="Ej: 20512345678"
                />
                {buscandoRuc && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {errorRuc && <p className="text-[10px] text-red-600 mt-1 leading-snug">{errorRuc}</p>}
            </div>
            
            {showRazonSocialManual ? (
              <div className="bg-red-50 border border-red-200 p-2 rounded-lg col-span-1">
                <label className="text-xs font-bold text-red-800">Razón Social Fallback (Manual)</label>
                <Input
                  required
                  value={formDespacho.razonSocialCliente}
                  onChange={(e) => setFormDespacho({ ...formDespacho, razonSocialCliente: e.target.value })}
                  placeholder="Ingrese Razón Social manualmente"
                  className="border-red-300 focus:border-red-500 mt-0.5"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-500">Razón Social Cliente</label>
                <Input
                  disabled
                  value={formDespacho.razonSocialCliente}
                  placeholder="Se autocompleta con el RUC..."
                  className="bg-slate-200 border-slate-300 text-slate-600"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-600">Puerto de Destino</label>
              <Input
                required
                value={formDespacho.puertoDestino}
                onChange={(e) => setFormDespacho({ ...formDespacho, puertoDestino: e.target.value })}
                placeholder="Ej: Puerto de Shanghái"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Reserva Naviera (Booking)</label>
              <Input
                required
                value={formDespacho.reservaNaviera}
                onChange={(e) => setFormDespacho({ ...formDespacho, reservaNaviera: e.target.value })}
                placeholder="Ej: BKG-SH-99635"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">N° Contenedor Frigorífico</label>
              <Input
                required
                value={formDespacho.numeroContenedorFrigorifico}
                onChange={(e) => setFormDespacho({ ...formDespacho, numeroContenedorFrigorifico: e.target.value })}
                placeholder="Ej: MSKU-886932-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Precintos Naviera/Aduanas</label>
              <Input
                required
                value={formDespacho.precintosAduanerosNavieros}
                onChange={(e) => setFormDespacho({ ...formDespacho, precintosAduanerosNavieros: e.target.value })}
                placeholder="Ej: AD-96532 / MSK-4458"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Temp. Seteo Contenedor (°C)</label>
              <Input
                type="number"
                step="0.1"
                required
                value={formDespacho.temperaturaSeteoContenedor || ''}
                onChange={(e) => setFormDespacho({ ...formDespacho, temperaturaSeteoContenedor: parseFloat(e.target.value) || 0 })}
                placeholder="Ej: -20.0"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Número DUS</label>
              <Input
                required
                value={formDespacho.numeroDUS}
                onChange={(e) => setFormDespacho({ ...formDespacho, numeroDUS: e.target.value })}
                placeholder="Ej: 118-2026-035412"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Certificado Sanitario SANIPES</label>
              <Input
                required
                value={formDespacho.codigoCertificadoSanitario}
                onChange={(e) => setFormDespacho({ ...formDespacho, codigoCertificadoSanitario: e.target.value })}
                placeholder="Ej: SANIPES-00352-26"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Estado Despacho</label>
              <Select
                value={formDespacho.estado}
                onChange={(e) => setFormDespacho({ ...formDespacho, estado: e.target.value as any })}
              >
                <option value="DESPACHADO_EN_TRANSITO">Despachado / Tránsito Marítimo</option>
                <option value="STOCK_DISPONIBLE">Stock Disponible (Conservar en Cámara)</option>
              </Select>
            </div>
            <div className="md:col-span-2 lg:col-span-4 flex justify-end">
              <Button type="submit" className="bg-indigo-950 text-white font-semibold">
                <Truck className="h-4 w-4 mr-1.5" /> Registrar Despacho de Exportación
              </Button>
            </div>
          </form>
        ) : (
          <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <div>
              <strong>Acceso Restringido:</strong> Solo usuarios con rol <strong>LOGISTICA</strong> o <strong>ADMIN</strong> pueden registrar despachos de exportación.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
