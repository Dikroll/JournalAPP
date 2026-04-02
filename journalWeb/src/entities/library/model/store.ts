import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LibraryCounters, LibraryMaterial, MaterialType } from './types'

interface LibraryStore {
	/** Материалы по ключу `${specId ?? 'all'}-${materialType}` */
	materialsMap: Record<string, LibraryMaterial[]>
	materialsLoadedAt: Record<string, number>

	/** Счётчики по ключу `${specId ?? 'all'}` — один на предмет, не на вкладку */
	countersMap: Record<string, LibraryCounters>
	countersLoadedAt: Record<string, number>

	loadingKeys: Set<string>
	errorKeys: Record<string, string>

	selectedSpecId: number | null
	selectedMaterialType: MaterialType | null

	setMaterials: (key: string, materials: LibraryMaterial[]) => void
	setMaterialsLoadedAt: (key: string, t: number) => void
	setCounters: (specKey: string, counters: LibraryCounters) => void
	setCountersLoadedAt: (specKey: string, t: number) => void
	setLoading: (key: string, loading: boolean) => void
	setError: (key: string, msg: string | null) => void
	setSelectedSpec: (specId: number | null) => void
	setSelectedMaterialType: (type: MaterialType | null) => void
	reset: () => void
}

export const useLibraryStore = create<LibraryStore>()(
	persist(
		set => ({
			materialsMap: {},
			materialsLoadedAt: {},
			countersMap: {},
			countersLoadedAt: {},
			loadingKeys: new Set(),
			errorKeys: {},
			selectedSpecId: null,
			selectedMaterialType: null,

			setMaterials: (key, materials) =>
				set(state => ({
					materialsMap: { ...state.materialsMap, [key]: materials },
				})),

			setMaterialsLoadedAt: (key, t) =>
				set(state => ({
					materialsLoadedAt: { ...state.materialsLoadedAt, [key]: t },
				})),

			setCounters: (specKey, counters) =>
				set(state => ({
					countersMap: { ...state.countersMap, [specKey]: counters },
				})),

			setCountersLoadedAt: (specKey, t) =>
				set(state => ({
					countersLoadedAt: { ...state.countersLoadedAt, [specKey]: t },
				})),

			setLoading: (key, loading) =>
				set(state => {
					const next = new Set(state.loadingKeys)
					loading ? next.add(key) : next.delete(key)
					return { loadingKeys: next }
				}),

			setError: (key, msg) =>
				set(state => ({
					errorKeys: msg
						? { ...state.errorKeys, [key]: msg }
						: Object.fromEntries(
								Object.entries(state.errorKeys).filter(([k]) => k !== key),
						  ),
				})),

			setSelectedSpec: specId => set({ selectedSpecId: specId }),
			setSelectedMaterialType: type => set({ selectedMaterialType: type }),

			reset: () =>
				set({
					materialsMap: {},
					materialsLoadedAt: {},
					countersMap: {},
					countersLoadedAt: {},
					loadingKeys: new Set(),
					errorKeys: {},
					selectedSpecId: null,
					selectedMaterialType: null,
				}),
		}),
		{
			name: 'library-store',
			partialize: state => ({
				materialsMap: state.materialsMap,
				materialsLoadedAt: state.materialsLoadedAt,
				countersMap: state.countersMap,
				countersLoadedAt: state.countersLoadedAt,
				selectedSpecId: state.selectedSpecId,
				selectedMaterialType: state.selectedMaterialType,
			}),
			onRehydrateStorage: () => state => {
				if (state) {
					state.loadingKeys = new Set()
					state.errorKeys = {}
				}
			},
		},
	),
)
