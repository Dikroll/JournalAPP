import { api } from '@/shared/api'
import { apiConfig } from '@/shared/config'
import type { GradeEntry } from '../model/types'

export const gradesApi = {
	getAll: () =>
		api.get<GradeEntry[]>(apiConfig.PROGRESS_VISITS).then(r => r.data),

	getBySubject: (specId: number) =>
		api
			.get<GradeEntry[]>(apiConfig.PROGRESS_VISITS, {
				params: { spec_id: specId },
			})
			.then(r => r.data),
}
