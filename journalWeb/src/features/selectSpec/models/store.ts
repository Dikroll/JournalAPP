import { create } from 'zustand'

interface SpecSelectorState {
	open: boolean
	search: string
	setOpen: (v: boolean) => void
	setSearch: (v: string) => void
	toggle: () => void
	close: () => void
}

export const useSpecSelectorStore = create<SpecSelectorState>()(set => ({
	open: false,
	search: '',
	setOpen: open => set({ open }),
	setSearch: search => set({ search }),
	toggle: () => set(s => ({ open: !s.open, search: s.open ? '' : s.search })),
	close: () => set({ open: false, search: '' }),
}))
