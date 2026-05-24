import { persistEncrypted } from '@/shared/lib/zustandEncryptedPersist'
import { create } from 'zustand'

interface OnboardingState {
	isDone: boolean
	setDone: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
	persistEncrypted(
		(set: any) => ({
			isDone: false,
			setDone: () => set({ isDone: true }),
		}),
		{
			name: 'onboarding-store',
			partialize: (state: any) => ({ isDone: state.isDone }),
		},
	) as any,
)
