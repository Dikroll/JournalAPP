import { api } from '@/shared/api'
import { apiConfig } from '@/shared/config'
import type { EvaluatePayload, FeedbackTag, PendingFeedback } from '../model/types'

export const feedbackApi = {
	getPending: () =>
		api.get<PendingFeedback[]>(apiConfig.FEEDBACK_PENDING).then(r => r.data),
	getTags: () =>
		api.get<FeedbackTag[]>(apiConfig.FEEDBACK_TAGS).then(r => r.data),
	evaluate: (payload: EvaluatePayload) =>
		api.post(apiConfig.FEEDBACK_EVALUATE, payload).then(r => r.data),
}
