import { ttl } from "@/shared/config/cache"
import { cachedFetch } from "@/shared/lib/cachedFetch"
import { useEffect, useState } from "react"
import { examApi } from "../api"
import type { FutureExamItem } from "../model/types"

const CACHE_KEY = "cache:exam:future"

interface State {
  exams: FutureExamItem[]
  status: "idle" | "loading" | "success" | "error"
}

export function useFutureExams() {
  const [state, setState] = useState<State>({ exams: [], status: "idle" })

  useEffect(() => {
    setState((s) => ({ ...s, status: "loading" }))

    cachedFetch<FutureExamItem[]>({
      key: CACHE_KEY,
      fetcher: examApi.getFutureExams,
      ttlSeconds: ttl.SCHEDULE, // 4 часа
      onData: (data) => setState({ exams: data, status: "success" }),
      onError: () => setState((s) => ({ ...s, status: "error" })),
    })
  }, [])

  return state
}