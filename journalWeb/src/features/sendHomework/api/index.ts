import { api } from '@/shared/api/instance'
import { apiConfig } from '@/shared/config/apiConfig'
import type { SubmitHomeworkPayload, UploadFileResponse } from '../model/types'

export interface EvaluateHomeworkPayload {
	id: null
	id_dom_zad: number
	id_stud: number
	mark: number
	comment: string
	tags: number[]
}

export const sendHomeworkApi = {
	uploadFile: (file: File): Promise<UploadFileResponse> => {
		const form = new FormData()
		form.append('file', file, file.name)
		return api
			.post<UploadFileResponse>(apiConfig.HOMEWORK_FILE_UPLOAD, form)
			.then(r => r.data)
	},

	submit: (payload: SubmitHomeworkPayload) =>
		api.post(apiConfig.HOMEWORK_SUBMIT, payload).then(r => r.data),

	evaluate: (payload: EvaluateHomeworkPayload) =>
		api.post(apiConfig.HOMEWORK_EVALUATE, payload).then(r => r.data),
}
