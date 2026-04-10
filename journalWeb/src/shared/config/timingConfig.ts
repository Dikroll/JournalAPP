/** Задержки и интервалы в миллисекундах */
export const timing = {
	/** Задержка перед проверкой обновлений (даём приложению прогрузиться) */
	APP_UPDATE_CHECK_DELAY: 3_000,
	/** Интервал автообновления домашних заданий */
	HOMEWORK_AUTO_REFRESH: 90 * 60 * 1000,
	/** Задержка показа success-состояния перед закрытием */
	SUCCESS_DISMISS_DELAY: 1_500,
	/** Задержка анимации закрытия sheet/modal */
	SHEET_CLOSE_ANIMATION: 300,
} as const
