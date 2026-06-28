import { create } from 'zustand'

interface NotificacionesState {
  alertasCount: number
  setAlertasCount: (n: number) => void
}

export const useNotificacionesStore = create<NotificacionesState>((set) => ({
  alertasCount: 0,
  setAlertasCount: (n) => set({ alertasCount: n }),
}))
