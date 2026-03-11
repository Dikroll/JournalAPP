import { api } from '@/shared/api'
import { apiConfig } from '@/shared/config'
import type { LeaderboardResponse } from '../model/types'

export const leaderboardApi = {
	getAll: () =>
		api
			.get<LeaderboardResponse>(apiConfig.DASHBOARD_LEADERBOARD)
			.then(r => r.data),
}
