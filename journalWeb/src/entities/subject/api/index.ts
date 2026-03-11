import { api } from '@/shared/api'
import { apiConfig } from '@/shared/config'
import type { Subject } from '../model/types'

export const subjectApi = {
	getAll: () => api.get<Subject[]>(apiConfig.LIBRARY_SPECS).then(r => r.data),
}
