import { api } from '@/shared/api'
import { apiConfig } from '@/shared/config'
import type {
	LibraryCounters,
	LibraryMaterial,
	MaterialType,
} from '../model/types'

export const libraryApi = {
	getMaterials: (specId?: number, materialType?: MaterialType) => {
		const params: Record<string, unknown> = { recommended_type: 0 }
		if (specId != null) params.spec_id = specId
		if (materialType != null) params.material_type = materialType

		return api
			.get<LibraryMaterial[]>(apiConfig.LIBRARY_MATERIALS, {
				params,
			})
			.then(r => r.data)
	},

	getAllMaterials: () =>
		api
			.get<LibraryMaterial[]>(apiConfig.LIBRARY_MATERIALS_ALL)
			.then(r => r.data),

	getCounters: (specId?: number, materialType?: MaterialType) => {
		const params: Record<string, unknown> = { recommended_type: 0 }
		if (specId != null) params.spec_id = specId
		if (materialType != null) params.material_type = materialType

		return api
			.get<LibraryCounters>(apiConfig.LIBRARY_COUNTERS, {
				params,
			})
			.then(r => r.data)
	},

	getSpecs: () =>
		api
			.get<{ id: number; name: string; short_name?: string }[]>(
				apiConfig.LIBRARY_SPECS,
			)
			.then(r => r.data),
}
