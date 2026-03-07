import { ttl } from "@/shared/config/cache"
import { cachedFetch } from "@/shared/lib/cachedFetch"
import { CACHE_KEYS } from "@/shared/lib/storage"
import { useCallback, useEffect, useRef, useState } from "react"
import { reviewsApi } from "../api"
import type { ReviewItem } from "../model/types"

export function useReviews() {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const loadingRef = useRef(false)

  const load = useCallback(() => {
    if (loadingRef.current) return
    loadingRef.current = true
    setStatus("loading")

    cachedFetch<ReviewItem[]>({
      key: CACHE_KEYS.REVIEWS,
      fetcher: () => reviewsApi.getList(),
      ttlSeconds: ttl.REVIEWS,
      onData: (data) => {
        setReviews([...data].reverse())
        setStatus("success")
        loadingRef.current = false
      },
      onError: () => {
        setStatus("error")
        loadingRef.current = false
      },
    })
  }, [])

  useEffect(() => { load() }, [])

  return { reviews, status }
}