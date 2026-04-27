import { useScheduleRemindersStore } from '@/features/scheduleReminders'
import { pageConfig } from '@/shared/config'
import { useThemeStore } from '@/shared/lib/themeStore'
import { BellRing, ChevronRight, Moon, Sun, Trash2, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
	onAccounts: () => void
	onClearCache: () => void
}

export function SettingsSection({ onAccounts, onClearCache }: Props) {
	const navigate = useNavigate()
	const { theme, toggleTheme } = useThemeStore()
	const remindersEnabled = useScheduleRemindersStore(s => s.enabled)

	return (
		<div className='space-y-2'>
			<p className='text-xs font-semibold text-app-muted uppercase tracking-wider px-1'>
				Настройки
			</p>

			<div
				className='rounded-[20px] overflow-hidden'
				style={{
					background: 'var(--color-surface)',
					border: '1px solid var(--color-border)',
					boxShadow: 'var(--shadow-card)',
				}}
			>
				{/* Аккаунты */}
				<button
					type='button'
					onClick={onAccounts}
					className='w-full flex items-center gap-3 px-4 py-3.5 active:bg-app-surface-hover transition-colors'
					style={{ WebkitTapHighlightColor: 'transparent' }}
				>
					<div
						className='w-8 h-8 rounded-xl flex items-center justify-center'
						style={{
							background: 'var(--color-brand-subtle)',
							border: '1px solid var(--color-brand-border)',
						}}
					>
						<Users size={15} className='text-brand' />
					</div>
					<span className='flex-1 text-sm font-medium text-app-text text-left'>
						Аккаунты
					</span>
					<span className='text-xs text-app-faint'>Переключить</span>
				</button>

				<div className='mx-4 h-px' style={{ background: 'var(--color-border)' }} />

				{/* Тема */}
				<button
					type='button'
					onClick={toggleTheme}
					className='w-full flex items-center gap-3 px-4 py-3.5 active:bg-app-surface-hover transition-colors'
					style={{ WebkitTapHighlightColor: 'transparent' }}
				>
					<div
						className='w-8 h-8 rounded-xl flex items-center justify-center'
						style={{
							background: 'var(--color-surface-strong)',
							border: '1px solid var(--color-border)',
						}}
					>
						{theme === 'dark' ? (
							<Moon size={15} className='text-app-muted' />
						) : (
							<Sun size={15} className='text-app-muted' />
						)}
					</div>
					<span className='flex-1 text-sm font-medium text-app-text text-left'>
						Тема
					</span>
					<div
						className='relative w-11 h-[26px] rounded-full transition-colors duration-300'
						style={{
							background: theme === 'light' ? 'var(--color-brand)' : 'var(--color-border-strong)',
						}}
					>
						<div
							className='absolute top-[3px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300'
							style={{
								transform: theme === 'light' ? 'translateX(22px)' : 'translateX(3px)',
							}}
						/>
					</div>
				</button>

				<div className='mx-4 h-px' style={{ background: 'var(--color-border)' }} />

				<button
					type='button'
					onClick={() => navigate(pageConfig.notificationSettings)}
					className='w-full flex items-center gap-3 px-4 py-3.5 active:bg-app-surface-hover transition-colors'
					style={{ WebkitTapHighlightColor: 'transparent' }}
				>
					<div
						className='w-8 h-8 rounded-xl flex items-center justify-center'
						style={{
							background: remindersEnabled
								? 'var(--color-brand-subtle)'
								: 'var(--color-surface-strong)',
							border: remindersEnabled
								? '1px solid var(--color-brand-border)'
								: '1px solid var(--color-border)',
						}}
					>
						<BellRing
							size={15}
							className={remindersEnabled ? 'text-brand' : 'text-app-muted'}
						/>
					</div>
					<span className='flex-1 text-sm font-medium text-app-text text-left'>
						Уведомления
					</span>
					<span className='text-xs text-app-faint'>
						{remindersEnabled ? 'Вкл' : 'Выкл'}
					</span>
					<ChevronRight size={16} className='text-app-faint' />
				</button>

				<div className='mx-4 h-px' style={{ background: 'var(--color-border)' }} />

				{/* Очистить кэш */}
				<button
					type='button'
					onClick={onClearCache}
					className='w-full flex items-center gap-3 px-4 py-3.5 active:bg-app-surface-hover transition-colors'
					style={{ WebkitTapHighlightColor: 'transparent' }}
				>
					<div className='w-8 h-8 rounded-xl flex items-center justify-center bg-danger-subtle border border-danger-border'>
						<Trash2 size={15} className='text-danger' />
					</div>
					<span className='flex-1 text-sm font-medium text-app-text text-left'>
						Очистить кэш
					</span>
					<span className='text-xs text-app-faint'>Сброс</span>
				</button>
			</div>
		</div>
	)
}
