import { api } from '@/shared/api/instance'
import { apiConfig } from '@/shared/config/apiConfig'
import type { ProfileDetails } from '../model/profileTypes'

export const profileApi = {
	getDetails: () =>
		api.get<ProfileDetails>(apiConfig.USER_PROFILE).then(r => r.data),
}
