import type { LoadingState } from '@/shared/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LeaderboardResponse } from './types'

interface LeaderboardState {
	data: LeaderboardResponse | null
	status: LoadingState
	loadedAt: number | null
	update: (patch: Partial<Omit<LeaderboardState, 'update'>>) => void
}

interface LegacyScoped {
	data?: LeaderboardResponse | null
	loadedAt?: number | null
}

export const useLeaderboardStore = create<LeaderboardState>()(
	persist(
		set => ({
			data: null,
			status: 'idle',
			loadedAt: null,
			update: patch => set(patch),
		}),
		{
			name: 'leaderboard-store',
			version: 2,
			partialize: state => ({
				data: state.data,
				loadedAt: state.loadedAt,
			}),
			migrate: (persisted, version) => {
				if (
					version < 2 &&
					persisted &&
					typeof persisted === 'object' &&
					'group' in persisted
				) {
					const group = (persisted as { group?: LegacyScoped }).group
					return {
						data: group?.data ?? null,
						loadedAt: group?.loadedAt ?? null,
					}
				}
				return persisted as { data: LeaderboardResponse | null; loadedAt: number | null }
			},
		},
	),
)
