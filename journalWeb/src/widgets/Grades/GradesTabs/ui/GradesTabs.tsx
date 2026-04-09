import { useScrollableTabs } from '@/shared/hooks'
import { BookOpen, CalendarDays, Clock, GraduationCap } from 'lucide-react'
import { useCallback } from 'react'

export type Tab = 'recent' | 'calendar' | 'subjects' | 'exams'

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
	{ key: 'recent', label: 'Недавние', icon: <Clock size={13} /> },
	{ key: 'calendar', label: 'Календарь', icon: <CalendarDays size={13} /> },
	{ key: 'subjects', label: 'По предметам', icon: <BookOpen size={13} /> },
	{ key: 'exams', label: 'Экзамены', icon: <GraduationCap size={13} /> },
]

interface Props {
	active: Tab
	onChange: (tab: Tab) => void
}

export function GradesTabs({ active, onChange }: Props) {
	const activeIndex = TABS.findIndex(t => t.key === active)
	const { scrollRef, showLeft, showRight } = useScrollableTabs(activeIndex)

	const handleTabClick = useCallback(
		(key: Tab) => {
			onChange(key)
		},
		[onChange],
	)

	return (
		<div className='space-y-2'>
			<div className='relative'>
				{showLeft && (
					<div
						className='absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none'
						style={{
							background:
								'linear-gradient(to right, var(--color-bg) 0%, transparent 100%)',
						}}
					/>
				)}
				{showRight && (
					<div
						className='absolute right-0 top-0 bottom-0 z-10 pointer-events-none'
						style={{ width: 40 }}
					>
						<div
							className='absolute inset-0'
							style={{
								background:
									'linear-gradient(to left, var(--color-bg) 30%, transparent 100%)',
							}}
						/>
						<svg
							className='absolute right-1 top-1/2 -translate-y-1/2'
							width='12'
							height='12'
							viewBox='0 0 12 12'
							fill='none'
						>
							<path
								d='M4 2l4 4-4 4'
								stroke='var(--color-text-muted)'
								strokeWidth='1.5'
								strokeLinecap='round'
								strokeLinejoin='round'
							/>
						</svg>
					</div>
				)}

				<div
					ref={scrollRef}
					className='flex gap-2 overflow-x-auto scrollbar-none'
					style={{
						WebkitOverflowScrolling: 'touch' as any,
						paddingRight: showRight ? 32 : 4,
						paddingBottom: 2,
						scrollBehavior: 'smooth',
					}}
				>
					{TABS.map(({ key, label, icon }) => {
						const isActive = active === key
						return (
							<button
								key={key}
								type='button'
								onClick={() => handleTabClick(key)}
								className='flex-shrink-0 flex items-center gap-1.5 rounded-2xl text-xs font-medium whitespace-nowrap'
								style={{
									minHeight: 44,
									paddingLeft: 16,
									paddingRight: 16,
									WebkitTapHighlightColor: 'transparent',
									background: isActive
										? 'var(--color-surface-strong)'
										: 'var(--color-surface)',
									border: isActive
										? '1.5px solid var(--color-border-strong)'
										: '1px solid var(--color-border)',
									color: isActive
										? 'var(--color-text)'
										: 'var(--color-text-muted)',
									boxShadow: isActive ? 'var(--shadow-card)' : 'none',
								}}
							>
								{icon}
								{label}
							</button>
						)
					})}
				</div>
			</div>

			<div className='flex justify-center items-center gap-1.5'>
				{TABS.map(({ key }) => {
					const isActive = active === key
					return (
						<div
							key={key}
							style={{
								width: isActive ? 20 : 5,
								height: 3,
								borderRadius: 2,
								background: isActive
									? 'var(--color-brand)'
									: 'var(--color-border-strong)',
								transition: 'all 0.25s ease',
							}}
						/>
					)
				})}
			</div>
		</div>
	)
}
