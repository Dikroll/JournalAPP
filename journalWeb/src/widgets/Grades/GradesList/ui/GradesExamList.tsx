import type { ExamResult } from '@/entities/exam'
import { useExamResults } from '@/entities/exam'
import { ErrorView, SkeletonList } from '@/shared/ui'
import { formatDate } from '@/shared/utils'
import { CheckCircle, Clock, GraduationCap } from 'lucide-react'

function getMarkColor(mark: number): string {
	if (mark >= 4)
		return 'text-status-checked bg-checked-subtle border-status-checked/30'
	if (mark === 3)
		return 'text-status-pending bg-pending-subtle border-status-pending/30'
	if (mark > 0)
		return 'text-status-overdue bg-overdue-bg border-status-overdue/30'
	return 'text-app-muted bg-app-surface-strong border-app-border'
}

function ExamRow({ exam }: { exam: ExamResult }) {
	const isPassed = exam.mark > 0

	return (
		<div
			className='grid gap-2.5 py-2'
			style={{ gridTemplateColumns: '1fr auto' }}
		>
			<div className='min-w-0'>
				<h4 className='text-sm font-semibold text-app-text leading-snug line-clamp-2'>
					{exam.spec}
				</h4>

				{exam.teacher && (
					<div className='flex items-center gap-1.5 mt-1'>
						<GraduationCap size={13} className='text-app-text flex-shrink-0' />
						<p className='text-xs text-app-muted leading-snug'>
							{exam.teacher}
						</p>
					</div>
				)}

				{isPassed && exam.date && (
					<div className='flex items-center gap-1 mt-1'>
						<CheckCircle
							size={11}
							className='text-status-checked flex-shrink-0'
						/>

						<span className='text-xs text-status-checked'>
							{formatDate(exam.date)}
						</span>
					</div>
				)}

				{exam.comment && (
					<p className='text-xs text-app-muted mt-0.5 line-clamp-1'>
						{exam.comment}
					</p>
				)}
			</div>

			{isPassed ? (
				<div
					className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border flex-shrink-0 ${getMarkColor(
						exam.mark,
					)}`}
				>
					{exam.mark}
				</div>
			) : (
				<div className='w-10 h-10 rounded-xl flex items-center justify-center bg-app-surface-strong border border-app-border flex-shrink-0'>
					<Clock size={16} className='text-app-muted' />
				</div>
			)}
		</div>
	)
}

export function GradesExamList() {
	const { exams, status } = useExamResults()

	if (status === 'loading') return <SkeletonList count={3} height={72} />

	if (status === 'error') {
		return <ErrorView message='Не удалось загрузить экзамены' />
	}

	if (exams.length === 0) {
		return (
			<p className='text-app-muted text-sm text-center py-8'>Нет экзаменов</p>
		)
	}

	const passed = exams.filter(e => e.mark > 0)
	const pending = exams.filter(e => e.mark === 0)

	const Section = ({
		title,
		items,
	}: {
		title: string
		items: ExamResult[]
	}) => {
		if (!items.length) return null
		return (
			<div className='space-y-2'>
				<p className='text-sm font-medium text-app-muted px-1'>{title}</p>
				<div
					className='bg-app-surface rounded-[24px] p-3 border border-app-border'
					style={{ boxShadow: 'var(--shadow-card)' }}
				>
					{items.map((exam, idx) => (
						<div key={exam.exam_id}>
							{idx > 0 && <div className='border-t border-app-border my-1' />}
							<ExamRow exam={exam} />
						</div>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className='space-y-4'>
			<Section title='Сданные' items={passed} />
			<Section title='Не сданные' items={pending} />
		</div>
	)
}
