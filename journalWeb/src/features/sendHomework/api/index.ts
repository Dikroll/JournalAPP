import { api } from "@/shared/api/instance"
import { apiConfig } from "@/shared/config/apiConfig"
import type { SubmitHomeworkPayload, UploadFileResponse } from "../model/types"

export const sendHomeworkApi = {
  /** POST /homework/upload-file — прокси сам идёт на fs.top-academy.ru */
  uploadFile: (file: File): Promise<UploadFileResponse> => {
    const form = new FormData()
    form.append("file", file, file.name)
    return api
      .post<UploadFileResponse>(apiConfig.HOMEWORK_FILE_UPLOAD, form)
      .then((r) => r.data)
  },

  /** POST /homework/submit — всегда JSON, file_path уже получен на предыдущем шаге */
  submit: (payload: SubmitHomeworkPayload) =>
    api.post(apiConfig.HOMEWORK_SUBMIT, payload).then((r) => r.data),
}