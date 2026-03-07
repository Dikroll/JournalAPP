import { ttl } from "@/shared/config/cache"
import { CACHE_KEYS, storage } from "@/shared/lib/storage"
import { useEffect } from "react"
import { reviewsApi } from "../api"
import { useReviewStore } from "../model/store"
import type { ReviewItem } from "../model/types"

export function useReviews() {
  const { reviews, status, loadedAt, setReviews, setStatus, setLoadedAt } = useReviewStore()

  useEffect(() => {
    if (status === "loading") return

    if (reviews.length > 0 && loadedAt && Date.now() - loadedAt < ttl.REVIEWS * 1000) return

    const cached = storage.get<ReviewItem[]>(CACHE_KEYS.REVIEWS)
    if (cached) {
      setReviews(cached)
      setLoadedAt(Date.now())
      setStatus("success")
      return
    }

    setStatus("loading")
    reviewsApi
      .getList()
      .then((data) => {
        const reversed = [...data].reverse()
        setReviews(reversed)
        setLoadedAt(Date.now())
        setStatus("success")
        storage.set(CACHE_KEYS.REVIEWS, reversed, ttl.REVIEWS)
      })
      .catch(() => setStatus("error"))
  }, [])

  return { reviews, status }
}