import { create } from 'zustand'
import type {
	LibraryCounters,
	LibraryLoadingState,
	LibraryMaterial,
	MaterialType,
} from './types'

interface LibraryStore {
	// State
	materials: LibraryMaterial[]
	counters: LibraryCounters | null
	status: LibraryLoadingState
	error: string | null
	selectedSpecId: number | null
	selectedMaterialType: MaterialType | null

	// Actions
	setMaterials: (materials: LibraryMaterial[]) => void
	setCounters: (counters: LibraryCounters) => void
	setStatus: (status: LibraryLoadingState) => void
	setError: (error: string | null) => void
	setSelectedSpec: (specId: number | null) => void
	setSelectedMaterialType: (type: MaterialType | null) => void
	reset: () => void

	// Helper
	getMaterialsByType: (type: MaterialType) => LibraryMaterial[]
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
	materials: [],
	counters: null,
	status: 'idle',
	error: null,
	selectedSpecId: null,
	selectedMaterialType: null,

	setMaterials: materials => set({ materials }),
	setCounters: counters => set({ counters }),
	setStatus: status => set({ status }),
	setError: error => set({ error }),
	setSelectedSpec: specId => set({ selectedSpecId: specId }),
	setSelectedMaterialType: type => set({ selectedMaterialType: type }),
	reset: () =>
		set({
			materials: [],
			counters: null,
			status: 'idle',
			error: null,
			selectedSpecId: null,
			selectedMaterialType: null,
		}),

	getMaterialsByType: (type: MaterialType): LibraryMaterial[] => {
		return get().materials.filter(m => m.material_type === type)
	},
}))
