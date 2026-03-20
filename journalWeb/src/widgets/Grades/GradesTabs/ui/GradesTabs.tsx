import { BookOpen, CalendarDays, Clock, GraduationCap } from 'lucide-react'

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
	return (
		<div className='flex gap-2 overflow-x-auto no-scrollbar'>
			{TABS.map(({ key, label, icon }) => (
				<button
					key={key}
					type='button'
					onClick={() => onChange(key)}
					className={`flex-shrink-0 flex items-center justify-center gap-1.5 h-10 px-3 rounded-2xl text-xs font-medium transition-colors whitespace-nowrap ${
						active === key
							? 'bg-app-surface-strong text-app-text border border-app-border-strong'
							: 'bg-app-surface text-app-muted border border-app-border hover:text-app-text hover:bg-app-surface-hover'
					}`}
				>
					{icon}
					{label}
				</button>
			))}
		</div>
	)
}