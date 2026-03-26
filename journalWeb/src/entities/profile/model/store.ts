import { create } from 'zustand'
import type { ProfileDetails } from './types'

interface ProfileDetailsState {
	details: ProfileDetails | null
	status: 'idle' | 'loading' | 'success' | 'error'
	setDetails: (d: ProfileDetails) => void
	setStatus: (s: 'idle' | 'loading' | 'success' | 'error') => void
}

export const useProfileDetailsStore = create<ProfileDetailsState>()(set => ({
	details: null,
	status: 'idle',
	setDetails: details => set({ details }),
	setStatus: status => set({ status }),
}))
