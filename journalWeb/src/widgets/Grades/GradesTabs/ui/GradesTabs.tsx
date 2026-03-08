import { BookOpen, CalendarDays, Clock } from 'lucide-react'

export type Tab = 'recent' | 'calendar' | 'subjects'

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
	{ key: 'recent', label: 'Недавние', icon: <Clock size={13} /> },
	{ key: 'calendar', label: 'Календарь', icon: <CalendarDays size={13} /> },
	{ key: 'subjects', label: 'По предметам', icon: <BookOpen size={13} /> },
]

interface Props {
	active: Tab
	onChange: (tab: Tab) => void
}

export function GradesTabs({ active, onChange }: Props) {
	return (
		<div className='flex gap-2'>
			{TABS.map(({ key, label, icon }) => (
				<button
					key={key}
					type='button'
					onClick={() => onChange(key)}
					className={`flex-1 flex items-center justify-center gap-1.5 h-10 px-2 rounded-2xl text-xs font-medium transition-colors whitespace-nowrap ${
						active === key
							? 'bg-white/15 text-[#F2F2F2] border border-white/20'
							: 'bg-white/5 text-[#6B7280] border border-white/10 hover:text-[#F2F2F2] hover:bg-white/8'
					}`}
				>
					{icon}
					{label}
				</button>
			))}
		</div>
	)
}
