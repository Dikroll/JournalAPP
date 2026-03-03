import { api } from "@/shared/api/instance"
import { apiConfig } from "@/shared/config/apiConfig"
import type { HomeworkCounters, HomeworkItem } from "../model/types"

export const homeworkApi = {
  getCounters: () =>
    api.get<HomeworkCounters>(apiConfig.HOMEWORK_COUNTERS).then((r) => r.data),

  getByStatus: (status: number, group_id: number, page?: number) =>
    api
      .get<HomeworkItem[]>(apiConfig.HOMEWORK_LIST, { params: { status, group_id, page } })
      .then((r) => r.data),

  getAllByStatus: (status: number, group_id: number) =>
    api
      .get<HomeworkItem[]>(apiConfig.HOMEWORK_LIST, { params: { status, group_id } })
      .then((r) => r.data),

  syncAll: (group_id: number) =>
    api
      .get<Record<string, HomeworkItem[]>>(apiConfig.HOMEWORK_SYNC, { params: { group_id } })
      .then((r) => r.data),
}