import { create } from 'zustand'

interface HydrationState {
	hasHydrated: boolean
	setHydrated: (hydrated: boolean) => void
}

export const useHydrationStore = create<HydrationState>(set => ({
	hasHydrated: false,
	setHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),
}))
