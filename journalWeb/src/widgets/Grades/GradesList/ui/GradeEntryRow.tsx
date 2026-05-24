import type { GradeEntryExpanded } from '@/entities/grades'
import { GRADE_TYPE_CONFIG, getGradeStyle } from '@/entities/grades'
import { CheckCircle, Clock, GraduationCap, Timer, XCircle } from 'lucide-react'

interface Props {
	entry: GradeEntryExpanded
	showSubject?: boolean
}

export function GradeEntryRow({ entry, showSubject = true }: Props) {
	const hasMarks = entry.flatMarks.length > 0

	const showTheme =
		entry.theme &&
		entry.theme.trim().toLowerCase() !== entry.spec_name.trim().toLowerCase()

	return (
		<div
			className='grid gap-2 py-2'
			style={{ gridTemplateColumns: '1fr auto' }}
		>
			<div className='min-w-0'>
				{showSubject && (
					<p className='text-sm font-semibold text-app-text leading-snug line-clamp-2'>
						{entry.spec_name}
					</p>
				)}

				{entry.teacher && (
					<div className='flex items-center gap-1.5 mt-1'>
						<GraduationCap size={13} className='text-app-text flex-shrink-0' />
						<p className='text-xs text-app-muted leading-snug'>
							{entry.teacher}
						</p>
					</div>
				)}

				{showTheme && (
					<p className='text-xs text-app-faint mt-0.5 leading-snug line-clamp-1'>
						{entry.theme}
					</p>
				)}

				<div className='flex items-center flex-wrap gap-1 mt-1.5'>
					{entry.attended === 'present' && (
						<span className='flex items-center gap-1 text-[11px] text-status-checked font-medium'>
							<CheckCircle size={11} className='flex-shrink-0' />
							Посетил
						</span>
					)}
					{entry.attended === 'late' && (
						<span className='flex items-center gap-1 text-[11px] font-medium' style={{ color: '#F59E0B' }}>
							<Timer size={11} className='flex-shrink-0' />
							Опоздание
						</span>
					)}
					{entry.attended === 'absent' && (
						<span className='flex items-center gap-1 text-[11px] text-status-overdue font-medium'>
							<XCircle size={11} className='flex-shrink-0' />
							Пропуск
						</span>
					)}
					{hasMarks && (
						<span className='w-1 h-1 rounded-full bg-app-border-strong flex-shrink-0' />
					)}
					{hasMarks &&
						entry.flatMarks.map(({ type }) => (
							<span
								key={type}
								className='px-1.5 py-0.5 rounded text-[10px] font-medium border'
								style={GRADE_TYPE_CONFIG[type].style}
							>
								{GRADE_TYPE_CONFIG[type].label}
							</span>
						))}
				</div>
			</div>

			<div className='flex flex-col items-end gap-1.5'>
				<span className='text-[11px] font-semibold text-app-muted bg-app-surface-strong border border-app-border rounded-md px-1.5 py-0.5 whitespace-nowrap'>
					Пара {entry.lesson_number}
				</span>

				{hasMarks ? (
					<div
						className='flex flex-wrap justify-end gap-1'
						style={{ maxWidth: entry.flatMarks.length > 2 ? 68 : undefined }}
					>
						{entry.flatMarks.map(({ type, value }) => (
							<div
								key={type}
								className='w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold border flex-shrink-0'
								style={getGradeStyle(value)}
							>
								{value}
							</div>
						))}
					</div>
				) : entry.attended === 'present' ? (
					<div className='w-8 h-8 rounded-xl flex items-center justify-center bg-app-surface-strong border border-app-border'>
						<Clock size={16} className='text-app-muted' />
					</div>
				) : entry.attended === 'late' ? (
					<div className='w-8 h-8 rounded-xl flex items-center justify-center' style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
						<Timer size={16} style={{ color: '#F59E0B' }} />
					</div>
				) : (
					<div className='w-8 h-8 rounded-xl flex items-center justify-center bg-overdue-bg border border-status-overdue/30'>
						<XCircle size={16} className='text-status-overdue' />
					</div>
				)}
			</div>
		</div>
	)
}
