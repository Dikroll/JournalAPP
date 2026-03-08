import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo } from './types'

interface UserState {
	user: UserInfo | null
	avatarUrl: string | null
	setUser: (user: UserInfo) => void
	setAvatarUrl: (url: string) => void
	clearUser: () => void
}

export const useUserStore = create<UserState>()(
	persist(
		set => ({
			user: null,
			avatarUrl: null,
			setUser: user => set({ user }),
			setAvatarUrl: avatarUrl => set({ avatarUrl }),
			clearUser: () => set({ user: null, avatarUrl: null }),
		}),
		{
			name: 'user-store',
			partialize: state => ({
				user: state.user,
				avatarUrl: state.avatarUrl,
			}),
		},
	),
)
