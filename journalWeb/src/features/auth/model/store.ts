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
	// Текущий активный аккаунт
	token: string | null
	isAuthenticated: boolean
	activeUsername: string | null

	// Все сохранённые аккаунты (до 5)
	accounts: SavedAccount[]

	setToken: (token: string) => void
	logout: () => void

	// Сохранить/обновить аккаунт в списке
	saveAccount: (account: SavedAccount) => void

	// Переключиться на другой аккаунт
	switchAccount: (username: string) => boolean

	// Удалить аккаунт из списка
	removeAccount: (username: string) => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			token: null,
			isAuthenticated: false,
			activeUsername: null,
			accounts: [],

			setToken: token => set({ token, isAuthenticated: true }),

			logout: () =>
				set(state => {
					// Удаляем текущий аккаунт из списка
					const accounts = state.accounts.filter(
						a => a.username !== state.activeUsername,
					)
					// Переключаемся на следующий если есть
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
						// Максимум 5 аккаунтов — убираем самый старый
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
