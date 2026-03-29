import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SavedAccount {
	username: string
	token: string
	fullName: string
	groupName: string
	avatarUrl: string | null
}

interface HydrationState {
	hasHydrated: boolean
}

export const useHydrationStore = create<HydrationState>()(() => ({
	hasHydrated: false,
}))

interface AuthState {
	token: string | null
	isAuthenticated: boolean
	activeUsername: string | null
	accounts: SavedAccount[]

	setToken: (token: string, username: string) => void
	logout: () => void
	saveAccount: (account: SavedAccount) => void
	switchAccount: (username: string) => boolean
	removeAccount: (username: string) => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			token: null,
			isAuthenticated: false,
			activeUsername: null,
			accounts: [],

			setToken: (token, username) =>
				set({ token, isAuthenticated: true, activeUsername: username }),

			/**
			 * ИСПРАВЛЕНИЕ: logout теперь корректно обрабатывает переключение
			 * на следующий аккаунт без дублирования логики в useAccountSwitcher.
			 */
			logout: () =>
				set(state => {
					const accounts = state.accounts.filter(
						a => a.username !== state.activeUsername,
					)
					if (accounts.length > 0) {
						const next = accounts[0]
						return {
							token: next.token,
							isAuthenticated: true,
							activeUsername: next.username,
							accounts,
						}
					}
					return {
						token: null,
						isAuthenticated: false,
						activeUsername: null,
						accounts,
					}
				}),

			saveAccount: account =>
				set(state => {
					const existing = state.accounts.findIndex(
						a => a.username === account.username,
					)
					let accounts: SavedAccount[]
					if (existing >= 0) {
						accounts = state.accounts.map(a =>
							a.username === account.username ? account : a,
						)
					} else {
						const trimmed =
							state.accounts.length >= 5
								? state.accounts.slice(0, 4)
								: state.accounts
						accounts = [account, ...trimmed]
					}
					return { accounts }
				}),

			switchAccount: username => {
				const account = get().accounts.find(a => a.username === username)
				if (!account) return false
				set({
					token: account.token,
					isAuthenticated: true,
					activeUsername: username,
				})
				return true
			},

			removeAccount: username =>
				set(state => ({
					accounts: state.accounts.filter(a => a.username !== username),
				})),
		}),
		{
			name: 'auth-store',
			partialize: state => ({
				token: state.token,
				isAuthenticated: state.isAuthenticated,
				activeUsername: state.activeUsername,
				accounts: state.accounts,
			}),
			onRehydrateStorage: () => (_state, error) => {
				if (error) console.warn('[auth-store] hydration error', error)
				useHydrationStore.setState({ hasHydrated: true })
			},
		},
	),
)
