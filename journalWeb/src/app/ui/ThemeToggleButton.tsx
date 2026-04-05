import { useThemeStore } from '@/shared/lib/themeStore'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggleButton() {
	const { theme, toggleTheme } = useThemeStore()

	return (
		<button
			onClick={toggleTheme}
			aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
			title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
			className='fixed bottom-20 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)] hover:border-[var(--color-text-muted)] active:bg-[var(--color-surface-active)] transition-all duration-300 ease-in-out shadow-md hover:shadow-lg text-[var(--color-text)] cursor-pointer'
			style={{ touchAction: 'manipulation' }}
		>
			{theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
		</button>
	)
}
