import { api } from '@/shared/api'
import { apiConfig } from '@/shared/config'
import type { ReviewItem } from '../model/types'

export const reviewsApi = {
	getList: () =>
		api.get<ReviewItem[]>(apiConfig.REVIEWS_LIST).then(r => r.data),
}
