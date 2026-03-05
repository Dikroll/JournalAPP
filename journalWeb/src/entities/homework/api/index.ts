import { api } from "@/shared/api/instance"
import { apiConfig } from "@/shared/config/apiConfig"
import type { HomeworkCounters, HomeworkItem } from "../model/types"

export interface HomeworkAllResponse {
  counters: HomeworkCounters
  items: Record<string, HomeworkItem[]> // "0" | "1" | "2" | "3" | "5"
}

export const homeworkApi = {
  /** Все статусы + счётчики за один запрос */
  getAll: (groupId: number, page = 1) =>
    api
      .get<HomeworkAllResponse>(apiConfig.HOMEWORK_ALL, {
        params: { group_id: groupId, page },
      })
      .then((r) => r.data),

  /** Подгрузка следующей страницы одного статуса */
  getByStatus: (status: number, groupId: number, page: number) =>
    api
      .get<HomeworkItem[]>(apiConfig.HOMEWORK_LIST, {
        params: { status, group_id: groupId, page },
      })
      .then((r) => r.data),
}