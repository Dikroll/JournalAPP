import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
	token: string | null
	isAuthenticated: boolean
	_hasHydrated: boolean
	setToken: (token: string) => void
	logout: () => void
	setHasHydrated: (val: boolean) => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		set => ({
			token: null,
			isAuthenticated: false,
			_hasHydrated: false,
			setToken: token => set({ token, isAuthenticated: true }),
			logout: () => set({ token: null, isAuthenticated: false }),
			setHasHydrated: val => set({ _hasHydrated: val }),
		}),
		{
			name: 'auth-store',
			partialize: state => ({
				token: state.token,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
)

useAuthStore.persist.onFinishHydration(state => {
	useAuthStore.setState({
		_hasHydrated: true,
		isAuthenticated: !!state.token,
	})
})

if (useAuthStore.persist.hasHydrated()) {
	const { token } = useAuthStore.getState()
	useAuthStore.setState({ _hasHydrated: true, isAuthenticated: !!token })
}
