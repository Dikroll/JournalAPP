import type { ScheduledPayment } from '@/entities/payment/model/types'
import { formatDateShort } from '@/shared/utils'
import { formatAmount } from '@/shared/utils/formatUtils'
import { CheckCircle, Circle } from 'lucide-react'

interface Props {
	schedule: ScheduledPayment[]
}

export function PaymentScheduleCard({ schedule }: Props) {
	return (
		<div
			className='bg-app-surface rounded-[24px] border border-app-border p-4'
			style={{ boxShadow: 'var(--shadow-card)' }}
		>
			<p className='text-sm font-semibold text-app-text mb-3'>
				График платежей
			</p>
			<div className='flex flex-col gap-2'>
				{schedule.map(item => (
					<div
						key={item.id}
						className='flex items-center gap-3 bg-app-surface-strong rounded-[16px] p-3'
					>
						{item.is_paid ? (
							<CheckCircle
								size={18}
								className='text-status-checked flex-shrink-0'
							/>
						) : (
							<Circle size={18} className='text-app-muted flex-shrink-0' />
						)}
						<div className='flex-1 min-w-0'>
							<p
								className={`text-sm font-medium ${
									item.is_paid ? 'text-app-muted line-through' : 'text-app-text'
								}`}
							>
								{item.description}
							</p>
							<p className='text-xs text-app-muted'>
								до {formatDateShort(item.due_date)}
							</p>
						</div>
						<p
							className={`text-sm font-bold flex-shrink-0 ${
								item.is_paid ? 'text-status-checked' : 'text-app-text'
							}`}
						>
							{formatAmount(item.amount)}
						</p>
					</div>
				))}
			</div>
		</div>
	)
}
