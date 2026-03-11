import { api } from '@/shared/api'
import { apiConfig } from '@/shared/config'
import type { ProfileDetails } from '../model/types'

export const profileApi = {
	getDetails: () =>
		api.get<ProfileDetails>(apiConfig.USER_PROFILE).then(r => r.data),
}
