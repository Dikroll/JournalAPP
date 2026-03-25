/**
 * @fileoverview Theme Toggle Button - красивая кнопка переключения темы
 *
 * Компонент отображает иконку солнца/луны и переключает тему приложения
 * при клике. Сохраняет выбор темы в localStorage через Zustand.
 *
 * @example
 * <ThemeToggleButton />
 */

import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../lib/themeStore'

/**
 * Компонент кнопки переключения темы
 *
 * Особенности:
 * - Использует Lucide иконки (Sun, Moon)
 * - Плавные переходы и анимации
 * - Фиксированная позиция внизу-справа
 * - Тёмный/светлый режимы с настраивается цветами
 * - Hover эффекты
 * - Сохранение выбора в localStorage
 */
export function ThemeToggleButton() {
	const { theme, toggleTheme } = useThemeStore()

	return (
		<button
			onClick={toggleTheme}
			aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
			title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
			className={`
				fixed bottom-20 right-4 z-50
				
				/* Размер и форма */
				w-10 h-10 rounded-full
				flex items-center justify-center
				
				/* Фон и граница */
				bg-[var(--color-surface)]
				border border-[var(--color-border)]
				
				/* Hover состояния */
				hover:bg-[var(--color-surface-hover)]
				hover:border-[var(--color-text-muted)]
				
				/* Active состояние */
				active:bg-[var(--color-surface-active)]
				
				/* Переходы */
				transition-all duration-300 ease-in-out
				
				/* Тень */
				shadow-md hover:shadow-lg
				
				/* Текст и иконка */
				text-[var(--color-text)]
				
				/* Курсор */
				cursor-pointer
				
				/* Focus состояние для доступности */
				focus-visible:outline-2 outline-offset-2 outline-[var(--color-brand)]
			`}
		>
			{/* Иконка Луны (видна в тёмном режиме) */}
			{theme === 'dark' && (
				<Moon
					size={20}
					className='transition-all duration-300 ease-in-out transform'
				/>
			)}

			{/* Иконка Солнца (видна в светлом режиме) */}
			{theme === 'light' && (
				<Sun
					size={20}
					className='transition-all duration-300 ease-in-out transform'
				/>
			)}
		</button>
	)
}
