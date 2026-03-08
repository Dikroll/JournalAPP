import { api } from "@/shared/api/instance"
import { apiConfig } from "@/shared/config/apiConfig"
import type { LeaderboardResponse } from "../model/types"

export const leaderboardApi = {
  getGroup: () =>
    api.get<LeaderboardResponse>(apiConfig.DASHBOARD_LEADERBOARD_GROUP).then((r) => r.data),
  getStream: () =>
    api.get<LeaderboardResponse>(apiConfig.DASHBOARD_LEADERBOARD_STREAM).then((r) => r.data),
}