import { api } from "@/shared/api/instance"
import { apiConfig } from "@/shared/config/apiConfig"
import type { HomeworkCounters, HomeworkItem } from "../model/types"

export interface HomeworkAllResponse {
  counters: HomeworkCounters
  items: Record<string, HomeworkItem[]>
}

export interface HomeworkBySubjectResponse {
  spec_id: number
  counters: HomeworkCounters
  items: Record<string, HomeworkItem[]>
}

export const homeworkApi = {
  getAll: (groupId: number, page = 1) =>
    api
      .get<HomeworkAllResponse>(apiConfig.HOMEWORK_ALL, {
        params: { group_id: groupId, page },
      })
      .then((r) => r.data),

  getByStatus: (status: number, groupId: number, page: number) =>
    api
      .get<HomeworkItem[]>(apiConfig.HOMEWORK_LIST, {
        params: { status, group_id: groupId, page },
      })
      .then((r) => r.data),

  getBySubject: (groupId: number, specId: number, page = 1) =>
    api
      .get<HomeworkBySubjectResponse>(apiConfig.HOMEWORK_BY_SUBJECT, {
        params: { group_id: groupId, spec_id: specId, page },
      })
      .then((r) => r.data),

  getByStatusAndSubject: (status: number, groupId: number, specId: number, page: number) =>
    api
      .get<HomeworkItem[]>(apiConfig.HOMEWORK_LIST, {
        params: { status, group_id: groupId, spec_id: specId, page },
      })
      .then((r) => r.data),

  deleteSubmission: (studId: number) =>
    api
      .post(apiConfig.HOMEWORK_DELETE, { id: studId })
      .then((r) => r.data),
}