'use client'
import { useState, useEffect } from 'react'
import { getTemperaturasPorLote, getResumenFrio } from '@/lib/api/calidad'
import type { AuditoriaCalidad, ResumenFrio } from '@/types'

export function useCalidad(idLote: number) {
  const [temperaturas, setTemperaturas] = useState<AuditoriaCalidad[]>([])
  const [resumen, setResumen] = useState<ResumenFrio | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!idLote) return
    Promise.all([
      getTemperaturasPorLote(idLote).catch(() => []),
      getResumenFrio(idLote).catch(() => null),
    ]).then(([temps, res]) => {
      setTemperaturas(temps)
      setResumen(res)
    }).finally(() => setLoading(false))
  }, [idLote])

  return { temperaturas, resumen, loading }
}
