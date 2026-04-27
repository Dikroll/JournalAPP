import { ExamRemindersSection } from '@/features/examReminders'
import {
	MasterRemindersToggle,
	ScheduleRemindersSection,
	useScheduleRemindersStore,
} from '@/features/scheduleReminders'
import { useSwipeBack } from '@/shared/hooks'
import { IconButton, PageHeader } from '@/shared/ui'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function NotificationSettingsPage() {
	const navigate = useNavigate()
	useSwipeBack()

	const enabled = useScheduleRemindersStore(s => s.enabled)

	return (
		<div className='pb-6 text-app-text'>
			<div className='flex items-center gap-2 px-4 pt-4 pb-4'>
				<IconButton
					icon={<ArrowLeft size={18} />}
					onClick={() => navigate(-1)}
					size='md'
					shape='square'
					variant='surface'
					style={{ boxShadow: 'var(--shadow-card)' }}
					aria-label='Назад'
				/>
				<div className='flex-1'>
					<PageHeader title='Уведомления' />
				</div>
			</div>

			<div className='px-4 space-y-3'>
				<MasterRemindersToggle />
				{enabled && <ScheduleRemindersSection />}
				{enabled && <ExamRemindersSection />}
			</div>
		</div>
	)
}
