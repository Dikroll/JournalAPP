import { api } from '@/shared/api'
import { apiConfig } from '@/shared/config'
import { getTodayString } from '@/shared/utils'
import type { LessonItem } from '../model/types'

export const scheduleApi = {
	getToday: () =>
		api
			.get<LessonItem[]>(apiConfig.SCHEDULE_BY_DATE, {
				params: { date_filter: getTodayString() },
			})
			.then(r => r.data),
	getByDate: (date: string) =>
		api
			.get<
				LessonItem[]
			>(apiConfig.SCHEDULE_BY_DATE, { params: { date_filter: date } })
			.then(r => r.data),
	getMonth: (date: string) =>
		api
			.get<LessonItem[]>(apiConfig.SCHEDULE_MONTH, { params: { date_filter: date } })
			.then(r => r.data),
	getWeek: (date: string) =>
		api
			.get<LessonItem[]>(apiConfig.SCHEDULE_WEEK, { params: { date_filter: date } })
			.then(r => r.data),
}
