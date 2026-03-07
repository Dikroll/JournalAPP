import type { LoadingState } from "@/shared/types"
import { create } from "zustand"
import type { ReviewItem } from "./types"

interface ReviewState {
  reviews: ReviewItem[]
  status: LoadingState
  loadedAt: number | null
  setReviews: (reviews: ReviewItem[]) => void
  setStatus: (s: LoadingState) => void
  setLoadedAt: (t: number) => void
}

export const useReviewStore = create<ReviewState>()((set) => ({
  reviews: [],
  status: "idle",
  loadedAt: null,
  setReviews: (reviews) => set({ reviews }),
  setStatus: (status) => set({ status }),
  setLoadedAt: (loadedAt) => set({ loadedAt }),
}))