import type { LoadingState } from "@/shared/types"
import { create } from "zustand"
import type { LeaderboardResponse, LeaderboardScope } from "./types"

interface ScopedData {
  data: LeaderboardResponse | null
  status: LoadingState
  loadedAt: number | null
}

interface LeaderboardState {
  group: ScopedData
  stream: ScopedData

  update: (scope: LeaderboardScope, patch: Partial<ScopedData>) => void
}

const empty: ScopedData = { data: null, status: "idle", loadedAt: null }

export const useLeaderboardStore = create<LeaderboardState>()((set) => ({
  group: { ...empty },
  stream: { ...empty },
  update: (scope, patch) =>
    set((state) => ({ [scope]: { ...state[scope], ...patch } })),
}))