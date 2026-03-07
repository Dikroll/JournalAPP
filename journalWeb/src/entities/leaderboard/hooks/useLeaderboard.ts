import { ttl } from "@/shared/config/cache"
import { cachedFetch } from "@/shared/lib/cachedFetch"
import { CACHE_KEYS } from "@/shared/lib/storage"
import { useCallback, useEffect, useState } from "react"
import { leaderboardApi } from "../api"
import type { LeaderboardResponse, LeaderboardScope } from "../model/types"

export function useLeaderboard(scope: LeaderboardScope) {
  const [data, setData] = useState<LeaderboardResponse | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const load = useCallback(() => {
    setStatus("loading")
    cachedFetch<LeaderboardResponse>({
      key: scope === "group" ? CACHE_KEYS.LEADERBOARD_GROUP : CACHE_KEYS.LEADERBOARD_STREAM,
      fetcher: () => scope === "group" ? leaderboardApi.getGroup() : leaderboardApi.getStream(),
      ttlSeconds: ttl.LEADERBOARD,
      onData: (d) => { setData(d); setStatus("success") },
      onError: () => setStatus("error"),
    })
  }, [scope])

  useEffect(() => { load() }, [scope])

  const students = scope === "group" ? data?.top_group : data?.top_stream
  const myRank = scope === "group" ? data?.my_rank?.group : data?.my_rank?.stream

  return { students: students ?? [], myRank, status }
}