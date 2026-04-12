import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeType = 'dark' | 'light'

interface ThemeState {
	theme: ThemeType
	setTheme: (theme: ThemeType) => void
	toggleTheme: () => void
	applyTheme: (theme: ThemeType) => void
}

export const useThemeStore = create<ThemeState>()(
	persist(
		set => ({
			theme: 'dark' as ThemeType,

			setTheme: (theme: ThemeType) => {
				set({ theme })
				applyThemeToDom(theme)
			},

			toggleTheme: () =>
				set(state => {
					const newTheme = state.theme === 'dark' ? 'light' : 'dark'
					applyThemeToDom(newTheme)
					return { theme: newTheme }
				}),

			applyTheme: (theme: ThemeType) => {
				applyThemeToDom(theme)
				set({ theme })
			},
		}),
		{
			name: 'theme-store',
			partialize: state => ({ theme: state.theme }),
			onRehydrateStorage: () => state => {
				if (state?.theme) {
					applyThemeToDom(state.theme)
				}
			},
		},
	),
)

function applyThemeToDom(theme: ThemeType): void {
	const html = document.documentElement
	html.classList.remove('light', 'dark')

	if (theme === 'light') {
		html.classList.add('light')
	} else {
		html.classList.add('dark')
	}
}
