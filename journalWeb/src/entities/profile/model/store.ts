import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProfileDetails } from './types'

interface ProfileDetailsState {
	details: ProfileDetails | null
	status: 'idle' | 'loading' | 'success' | 'error'
	setDetails: (d: ProfileDetails) => void
	setStatus: (s: 'idle' | 'loading' | 'success' | 'error') => void
}

export const useProfileDetailsStore = create<ProfileDetailsState>()(
	persist(
		set => ({
			details: null,
			status: 'idle',
			setDetails: details => set({ details }),
			setStatus: status => set({ status }),
		}),
		{
			name: 'profile-details-store',
			partialize: state => ({
				details: state.details,
			}),
		},
	),
)
