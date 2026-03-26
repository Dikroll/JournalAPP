/**
 * @fileoverview Root App Component - точка входа приложения
 *
 * Отвечает за:
 * - Инициализацию пользователя (useInitUser)
 * - Загрузку сохранённой темы из localStorage
 * - Отображение маршрутизации приложения
 * - Кнопка переключения темы (для разработки и юзеров)
 *
 * Структура:
 * - useInitUser() загружает данные пользователя
 * - useThemeStore используется для управления темой (с сохранением в localStorage)
 * - ThemeToggleButton компонент для красивой кнопки переключения
 * - AppRouter содержит все маршруты приложения
 */

import { useInitUser } from '@/features/initUser/hooks/useInitUser'
import { AppRouter } from './router'
import { ThemeToggleButton } from './ui/ThemeToggleButton'

/**
 * Root компонент приложения
 *
 * Эффекты:
 * - useInitUser() - загружает данные текущего пользователя при монтировании
 * - useThemeStore автоматически применяет тему из localStorage
 */
export function App() {
	// Инициализируем пользователя при загрузке
	useInitUser()

	return (
		<>
			{/* Кнопка переключения темы - красивая, сохраняет выбор */}
			<ThemeToggleButton />

			{/* Маршруты приложения */}
			<AppRouter />
		</>
	)
}
