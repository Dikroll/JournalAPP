import { getDaysUntilDeadline } from '@/shared/utils'
import { Calendar, Clock } from 'lucide-react'
interface Props {
	issuedDate: string
	deadline: string
	isOverdue: boolean
	isNew?: boolean
}

export function HomeworkCardDates({
	issuedDate,
	deadline,
	isOverdue,
	isNew,
}: Props) {
	const daysLeft = isNew && !isOverdue ? getDaysUntilDeadline(deadline) : null
	const isUrgentYellow = daysLeft != null && daysLeft <= 3 && daysLeft > 0
	const isUrgentRed = daysLeft === 0
	const isUrgent = isUrgentYellow || isUrgentRed

	return (
		<div className='flex gap-4 mb-4'>
			<div className='flex items-center gap-1.5 text-sm text-app-muted'>
				<Calendar size={13} />
				<span>{issuedDate}</span>
			</div>
			<div className='flex items-center gap-1.5 text-sm'>
				<Clock
					size={13}
					className={
						isOverdue || isUrgentRed
							? 'text-status-overdue'
							: isUrgentYellow
							? 'text-status-pending'
							: 'text-app-muted'
					}
				/>
				<span
					className={
						isOverdue
							? 'text-status-overdue font-semibold'
							: isUrgentRed
							? 'text-status-overdue font-semibold drop-shadow-[0_0_6px_rgba(220,38,38,0.6)]'
							: isUrgentYellow
							? 'text-status-pending font-semibold drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]'
							: 'text-app-muted'
					}
				>
					{deadline}
				</span>
				{isUrgent && (
					<span
						className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
							isUrgentRed
								? 'bg-overdue-bg text-status-overdue'
								: 'bg-pending-subtle text-status-pending'
						}`}
					>
						{daysLeft === 0 ? 'сегодня' : 'завтра'}
					</span>
				)}
			</div>
		</div>
	)
}
