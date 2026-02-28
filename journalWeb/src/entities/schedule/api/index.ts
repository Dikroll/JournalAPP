import { api } from "@/shared/api/instance"
import { apiConfig } from "@/shared/config/apiConfig"
import type { LessonItem } from "../model/types"

export const scheduleApi = {
	getToday: () => api.get<LessonItem[]>(apiConfig.SCHEDULE_TODAY).then((r) => r.data),
	getByDate: (date: string) =>
		api
			.get<LessonItem[]>(apiConfig.SCHEDULE_BY_DATE, { params: { date_filter: date } })
			.then((r) => r.data),
	getMonth: (date: string) =>
		api
			.get<LessonItem[]>(apiConfig.SCHEDULE_MONTH, { params: { date_filter: date } })
			.then((r) => r.data),
};
