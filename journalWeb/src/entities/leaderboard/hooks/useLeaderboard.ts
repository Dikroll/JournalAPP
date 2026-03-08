import { ttl } from "@/shared/config/cache"
import { CACHE_KEYS, storage } from "@/shared/lib/storage"
import { useEffect } from "react"
import { leaderboardApi } from "../api"
import { useLeaderboardStore } from "../model/store"
import type { LeaderboardResponse, LeaderboardScope } from "../model/types"

export function useLeaderboard(scope: LeaderboardScope) {
  const scopeData = useLeaderboardStore((s) => s[scope])
  const update = useLeaderboardStore((s) => s.update)

  const { data, status, loadedAt } = scopeData

  useEffect(() => {
    if (status === "loading") return
    if (data && loadedAt && Date.now() - loadedAt < ttl.LEADERBOARD * 1000) return

    const cacheKey = scope === "group" ? CACHE_KEYS.LEADERBOARD_GROUP : CACHE_KEYS.LEADERBOARD_STREAM
    const cached = storage.get<LeaderboardResponse>(cacheKey)
    if (cached) {
      update(scope, { data: cached, status: "success", loadedAt: Date.now() })
      return
    }

    update(scope, { status: "loading" })
    const fetcher = scope === "group" ? leaderboardApi.getGroup : leaderboardApi.getStream
    fetcher()
      .then((d) => {
        update(scope, { data: d, status: "success", loadedAt: Date.now() })
        storage.set(cacheKey, d, ttl.LEADERBOARD)
      })
      .catch(() => update(scope, { status: "error" }))
  }, [scope])

  const students = scope === "group" ? data?.top_group : data?.top_stream
  const myRank = scope === "group" ? data?.my_rank?.group : data?.my_rank?.stream

  return { students: students ?? [], myRank, status }
}