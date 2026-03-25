/**
 * @fileoverview Theme Store - управление светлой/тёмной темой
 *
 * Использует Zustand с persist middleware для:
 * - Сохранения выбранной темы в localStorage
 * - Восстановления темы при загрузке приложения
 * - Синхронизации с DOM (классы на document.documentElement)
 *
 * @example
 * const { theme, setTheme, toggleTheme } = useThemeStore()
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Допустимые темы приложения
 */
export type ThemeType = 'dark' | 'light'

/**
 * Состояние store'а для управления темой
 */
interface ThemeState {
	/** Текущая активная тема */
	theme: ThemeType

	/**
	 * Установить конкретную тему
	 * @param theme - 'dark' или 'light'
	 */
	setTheme: (theme: ThemeType) => void

	/**
	 * Переключить тему на противоположную
	 */
	toggleTheme: () => void

	/**
	 * Применить тему к DOM элементам
	 * Вызывается автоматически при смене темы
	 */
	applyTheme: (theme: ThemeType) => void
}

/**
 * Zustand store для сохранения и управления темой
 *
 * Использует persist middleware:
 * - Ключ: 'theme-store'
 * - Сохраняет только поле 'theme' (не методы)
 * - Загружает тему из localStorage при инициализации
 */
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
			// Сохраняем только тему, не методы
			partialize: state => ({ theme: state.theme }),
			// При загрузке из localStorage применяем класс к DOM
			onRehydrateStorage: () => state => {
				if (state?.theme) {
					applyThemeToDom(state.theme)
				}
			},
		},
	),
)

/**
 * Вспомогательная функция для применения темы к DOM
 * Добавляет/удаляет класс 'light' на document.documentElement
 *
 * @internal
 * @param theme - тема для применения
 */
function applyThemeToDom(theme: ThemeType): void {
	const html = document.documentElement
	html.classList.remove('light', 'dark')

	if (theme === 'light') {
		html.classList.add('light')
	} else {
		html.classList.add('dark')
	}
}
