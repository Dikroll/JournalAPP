import { pageConfig } from '@/shared/config'
import { BookOpen, Calendar, GraduationCap, Home } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabs = [
	{ to: pageConfig.home, icon: Home, label: 'Дом', end: true },
	{ to: pageConfig.grades, icon: GraduationCap, label: 'Оценки', end: false },
	{ to: pageConfig.schedule, icon: Calendar, label: 'Расписание', end: false },
	{ to: pageConfig.homework, icon: BookOpen, label: 'ДЗ', end: false },
]

export function BottomBar() {
	return (
		<nav className='fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50'>
			<div
				className='bg-white/5 backdrop-blur-xl rounded-[28px] px-6 py-3.5 border border-white/10'
				style={{
					boxShadow:
						'0 8px 32px 0 rgba(0, 0, 0, 0.5), 0 4px 16px 0 rgba(218, 199, 201, 0.1)',
				}}
			>
				<div className='flex justify-around items-center gap-2'>
					{tabs.map(({ to, icon: Icon, label, end }) => (
						<NavLink
							key={to}
							to={to}
							end={end}
							className='relative flex items-center justify-center p-3 transition-all duration-300 rounded-full'
							aria-label={label}
						>
							{({ isActive }) => (
								<>
									{isActive && (
										<div className='absolute inset-0 bg-[#D9D9D9]/15 rounded-full' />
									)}
									<Icon
										size={22}
										strokeWidth={isActive ? 2 : 1.5}
										className={`relative transition-all duration-300 ${
											isActive ? 'text-[#D81D1D]' : 'text-[#F2F2F2]/50'
										}`}
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
