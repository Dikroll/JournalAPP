import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingState {
	isDone: boolean
	setDone: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
	persist(
		set => ({
			isDone: false,
			setDone: () => set({ isDone: true }),
		}),
		{
			name: 'onboarding-store',
			partialize: state => ({ isDone: state.isDone }),
		},
	),
)
