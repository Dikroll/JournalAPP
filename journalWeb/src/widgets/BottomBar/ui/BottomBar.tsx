import { pageConfig } from '@/shared/config'
import { BookOpen, Calendar, GraduationCap, Home } from 'lucide-react'
import { useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
	{ to: pageConfig.home, icon: Home, exact: true },
	{ to: pageConfig.grades, icon: GraduationCap, exact: false },
	{ to: pageConfig.schedule, icon: Calendar, exact: false },
	{ to: pageConfig.homework, icon: BookOpen, exact: false },
]

export function BottomBar() {
	const navigate = useNavigate()
	const location = useLocation()

	// Храним координату начала тача — если палец сдвинулся (скролл), не навигируем
	const touchStartY = useRef<number>(0)
	const touchStartX = useRef<number>(0)

	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		touchStartY.current = e.touches[0].clientY
		touchStartX.current = e.touches[0].clientX
	}, [])

	const makeHandleTouchEnd = useCallback(
		(to: string) => (e: React.TouchEvent) => {
			const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
			const dx = Math.abs(e.changedTouches[0].clientX - touchStartX.current)
			if (dy > 10 || dx > 10) return
			navigate(to)
		},
		[navigate],
	)

	return (
		<nav className='fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50'>
			<div
				className='bg-app-surface backdrop-blur-xl rounded-[28px] px-6 py-3.5 border border-app-border'
				style={{ boxShadow: 'var(--shadow-nav)' }}
			>
				<div className='flex justify-around items-center'>
					{tabs.map(({ to, icon: Icon, exact }) => {
						const isActive = exact
							? location.pathname === to
							: location.pathname.startsWith(to)

						return (
							<button
								key={to}
								type='button'
								onTouchStart={handleTouchStart}
								onTouchEnd={makeHandleTouchEnd(to)}
								onClick={() => navigate(to)}
								className='relative flex flex-col items-center justify-center px-4 transition-all duration-300 bg-transparent border-0 outline-none cursor-pointer'
								style={{
									minWidth: 44,
									minHeight: 44,
									WebkitTapHighlightColor: 'transparent',
									touchAction: 'manipulation',
								}}
							>
								{isActive && (
									<span
										className='absolute bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-5 rounded-full'
										style={{ background: 'var(--color-brand)' }}
									/>
								)}
								<Icon
									size={22}
									strokeWidth={isActive ? 2.2 : 1.5}
									style={{
										color: isActive
											? 'var(--color-brand)'
											: 'var(--color-text-muted)',
										transition: 'color 0.25s ease',
									}}
								/>
							</button>
						)
					})}
				</div>
			</div>
		</nav>
	)
}
