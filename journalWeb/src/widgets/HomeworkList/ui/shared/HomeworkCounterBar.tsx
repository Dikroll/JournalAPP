import type { HomeworkCounters, HomeworkStatus } from '@/entities/homework'

interface Props {
	counters: HomeworkCounters
	activeFilter: HomeworkStatus | null
	onFilter: (key: HomeworkStatus | null) => void
}

const ITEMS = [
	{
		key: 'total',
		label: 'Всего',
		color: 'text-app-text',
		ring: 'ring-app-border-strong',
		status: null,
	},
	{
		key: 'new',
		label: 'Новых',
		color: 'text-status-new',
		ring: 'ring-status-new',
		status: 'new' as HomeworkStatus,
	},
	{
		key: 'pending',
		label: 'На проверке',
		color: 'text-status-pending',
		ring: 'ring-status-pending',
		status: 'pending' as HomeworkStatus,
	},
	{
		key: 'checked',
		label: 'Проверено',
		color: 'text-status-checked',
		ring: 'ring-status-checked',
		status: 'checked' as HomeworkStatus,
	},
	{
		key: 'overdue',
		label: 'Просрочено',
		color: 'text-status-overdue',
		ring: 'ring-status-overdue',
		status: 'overdue' as HomeworkStatus,
	},
	{
		key: 'returned',
		label: 'Возвращено',
		color: 'text-status-returned',
		ring: 'ring-status-returned',
		status: 'returned' as HomeworkStatus,
	},
] as const

export function HomeworkCountersBar({
	counters,
	activeFilter,
	onFilter,
}: Props) {
	return (
		<div className='-mx-4 overflow-x-auto scrollbar-none'>
			<div className='flex gap-2 px-4 py-2 w-max'>
				{ITEMS.map(({ key, label, color, ring, status }) => {
					const isActive = activeFilter === status
					return (
						<button
							key={key}
							type='button'
							onClick={() => onFilter(isActive ? null : status)}
							className={[
								'flex-shrink-0 px-3 py-2 rounded-2xl text-center min-w-[72px] transition-all duration-200 active:scale-95',
								isActive
									? `bg-app-surface-active ring-2 ${ring}`
									: 'bg-app-surface border border-app-border hover:bg-app-surface-hover',
							].join(' ')}
						>
							<div className={`text-lg font-bold ${color}`}>
								{counters[key]}
							</div>
							<div className='text-xs text-app-muted'>{label}</div>
						</button>
					)
				})}
			</div>
		</div>
	)
}
