'use client'
import { useState, useEffect } from 'react'
import { getLotes, getLoteById } from '@/lib/api/lotes'
import type { LotePesca } from '@/types'
import { LOTES_MOCK } from '@/types'

export function useLotes() {
  const [lotes, setLotes] = useState<LotePesca[]>(LOTES_MOCK)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLotes()
      .then(setLotes)
      .catch(() => setLotes(LOTES_MOCK))
      .finally(() => setLoading(false))
  }, [])

  return { lotes, loading, refetch: () => getLotes().then(setLotes).catch(() => {}) }
}

export function useLote(id: number) {
  const [lote, setLote] = useState<LotePesca | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getLoteById(id)
      .then(setLote)
      .catch(() => setLote(LOTES_MOCK.find(l => l.id === id) || null))
      .finally(() => setLoading(false))
  }, [id])

  return { lote, loading }
}
