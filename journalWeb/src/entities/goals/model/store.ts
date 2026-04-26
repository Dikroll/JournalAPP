import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Goal, GoalsState } from './types'

function clampTarget(value: number): number {
	if (!Number.isFinite(value)) return 3
	return Math.max(2, Math.min(5, Math.round(value)))
}

export const useGoalsStore = create<GoalsState>()(
	persist(
		set => ({
			targets: {},

			setTarget: (specId, target) =>
				set(state => {
					const now = Date.now()
					const existing = state.targets[specId]
					const clamped = clampTarget(target)
					const next: Goal = existing
						? { target: clamped, createdAt: existing.createdAt, updatedAt: now }
						: { target: clamped, createdAt: now, updatedAt: now }
					return { targets: { ...state.targets, [specId]: next } }
				}),

			removeTarget: specId =>
				set(state => {
					// Destructure to omit the entry; rename to _removed to satisfy noUnusedLocals
					const { [specId]: _removed, ...rest } = state.targets
					return { targets: rest }
				}),

			reset: () => set({ targets: {} }),
		}),
		{
			name: 'goals-store',
			version: 1,
			partialize: state => ({ targets: state.targets }),
		},
	),
)
