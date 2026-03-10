import { api } from '@/shared/api'
import { apiConfig } from '@/shared/config'
import type { FutureExamItem } from '../model/types'

export const examApi = {
	getFutureExams: () =>
		api
			.get<FutureExamItem[]>(apiConfig.PROGRESS_FUTURE_EXAMS)
			.then(r => r.data),
}
