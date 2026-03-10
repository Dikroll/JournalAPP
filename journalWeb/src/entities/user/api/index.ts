import { api } from '@/shared/api'
import { apiConfig } from '@/shared/config'
import type { UserInfo } from '../model/types'

export const userApi = {
	getMe: () => api.get<UserInfo>(apiConfig.USER_ME).then(r => r.data),
}
