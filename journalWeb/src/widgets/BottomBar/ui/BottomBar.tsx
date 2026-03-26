import { pageConfig } from '@/shared/config'
import { BookOpen, Calendar, GraduationCap, Home } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabs = [
	{ to: pageConfig.home, icon: Home, end: true },
	{ to: pageConfig.grades, icon: GraduationCap, end: false },
	{ to: pageConfig.schedule, icon: Calendar, end: false },
	{ to: pageConfig.homework, icon: BookOpen, end: false },
]

export function BottomBar() {
	return (
		<nav className='fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50'>
			<div
				className='bg-app-surface backdrop-blur-xl rounded-[28px] px-6 py-3.5 border border-app-border'
				style={{ boxShadow: 'var(--shadow-nav)' }}
			>
				<div className='flex justify-around items-center'>
					{tabs.map(({ to, icon: Icon, end }) => (
						<NavLink
							key={to}
							to={to}
							end={end}
							className='relative flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-300'
						>
							{({ isActive }) => (
								<>
									{isActive && (
										<span
											className='absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] w-5 rounded-full'
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
								</>
							)}
						</NavLink>
					))}
				</div>
			</div>
		</nav>
	)
}
