import { api } from "@/shared/api/instance";
import type { LessonItem } from "../model/types";

export const scheduleApi = {
	getToday: () => api.get<LessonItem[]>("/schedule/today").then((r) => r.data),
	getByDate: (date: string) =>
		api
			.get<LessonItem[]>("/schedule/by-date", { params: { date_filter: date } })
			.then((r) => r.data),
	getMonth: (date: string) =>
		api
			.get<LessonItem[]>("/schedule/month", { params: { date_filter: date } })
			.then((r) => r.data),
};
