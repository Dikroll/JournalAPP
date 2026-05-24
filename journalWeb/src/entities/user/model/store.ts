import { persistEncrypted } from '@/shared/lib/zustandEncryptedPersist'
import { create } from 'zustand'
import type { UserInfo } from './types'

interface UserState {
	user: UserInfo | null
	setUser: (user: UserInfo) => void
	clearUser: () => void
}

export const useUserStore = create<UserState>()(
	persistEncrypted(
		set => ({
			user: null,
			setUser: user => set({ user }),
			clearUser: () => set({ user: null }),
		}),
		{
			name: 'user-store',
			partialize: state => ({ user: state.user }),
		},
	),
)
