import type { GradeEntryExpanded } from '@/entities/grades'
import { GRADE_TYPE_CONFIG, getGradeColor } from '@/entities/grades'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

interface Props {
	entry: GradeEntryExpanded
	showSubject?: boolean
}

export function GradeEntryRow({ entry, showSubject = true }: Props) {
	return (
		<div className='flex items-center justify-between py-2'>
			<div className='flex-1 min-w-0 mr-3'>
				<div className='flex items-center gap-2 mb-1'>
					{showSubject && (
						<h4 className='text-sm font-semibold text-app-text truncate'>
							{entry.spec_name}
						</h4>
					)}
					<span className='text-xs text-app-muted flex-shrink-0'>
						Пара {entry.lesson_number}
					</span>
				</div>
				<p className='text-xs text-app-muted truncate mb-1.5'>{entry.theme}</p>
				<div className='flex items-center gap-2 flex-wrap'>
					{entry.attended ? (
						<div className='flex items-center gap-1'>
							<CheckCircle size={12} className='text-status-checked' />
							<span className='text-xs font-medium text-status-checked'>Посетил</span>
						</div>
					) : (
						<div className='flex items-center gap-1'>
							<XCircle size={12} className='text-status-overdue' />
							<span className='text-xs font-medium text-status-overdue'>Пропуск</span>
						</div>
					)}
					{entry.flatMarks.map(({ type }) => (
						<span
							key={type}
							className={`px-2 py-0.5 rounded-full text-xs font-medium border ${GRADE_TYPE_CONFIG[type].color}`}
						>
							{GRADE_TYPE_CONFIG[type].label}
						</span>
					))}
				</div>
			</div>

			<div className='flex items-center gap-1 flex-shrink-0'>
				{!entry.attended ? (
					<div className='w-10 h-10 rounded-xl flex items-center justify-center bg-overdue-bg border border-status-overdue/30'>
						<XCircle size={20} className='text-status-overdue' />
					</div>
				) : entry.flatMarks.length === 0 ? (
					<div className='w-10 h-10 rounded-xl flex items-center justify-center bg-app-surface-strong border border-app-border'>
						<Clock size={16} className='text-app-muted' />
					</div>
				) : (
					entry.flatMarks.map(({ type, value }) => (
						<div
							key={type}
							className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border ${getGradeColor(value)}`}
						>
							{value}
						</div>
					))
				)}
			</div>
		</div>
	)
}