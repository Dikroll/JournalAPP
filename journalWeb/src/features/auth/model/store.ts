import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface HydrationState {
	hasHydrated: boolean
}

export const useHydrationStore = create<HydrationState>()(() => ({
	hasHydrated: false,
}))

interface AuthState {
	token: string | null
	isAuthenticated: boolean
	setToken: (token: string) => void
	logout: () => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		set => ({
			token: null,
			isAuthenticated: false,
			setToken: token => set({ token, isAuthenticated: true }),
			logout: () => set({ token: null, isAuthenticated: false }),
		}),
		{
			name: 'auth-store',
			partialize: state => ({
				token: state.token,
				isAuthenticated: state.isAuthenticated,
			}),
			onRehydrateStorage: () => error => {
				if (error) {
					console.warn('[auth-store] hydration error', error)
				}

				useHydrationStore.setState({ hasHydrated: true })
			},
		},
	),
)
