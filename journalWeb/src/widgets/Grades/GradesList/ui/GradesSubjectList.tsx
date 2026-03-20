import type { SubjectStats } from '@/entities/grades'
import { GRADE_TYPE_CONFIG } from '@/entities/grades'
import type { SortKey } from '@/features/sortSubjects'
import {
	SortSubjectsControl,
	useSortSubjectsStore,
} from '@/features/sortSubjects'
import { useLazyItems } from '@/shared/hooks'

function sortSubjects(subjects: SubjectStats[], key: SortKey): SubjectStats[] {
	const arr = [...subjects]
	if (key === 'alpha')
		return arr.sort((a, b) => a.spec_name.localeCompare(b.spec_name, 'ru'))
	if (key === 'grade-desc')
		return arr.sort((a, b) => b.averageGrade - a.averageGrade)
	if (key === 'grade-asc')
		return arr.sort((a, b) => a.averageGrade - b.averageGrade)
	return arr
}

interface Props {
	bySubject: SubjectStats[]
}

export function GradesSubjectList({ bySubject }: Props) {
	const sortKey = useSortSubjectsStore(s => s.sortKey)
	const sorted = sortSubjects(bySubject, sortKey)
	const { visibleCount, sentinelRef } = useLazyItems(sorted.length)

	if (bySubject.length === 0) {
		return <p className='text-app-muted text-sm text-center py-8'>Нет данных</p>
	}

	return (
		<div className='space-y-3'>
			<SortSubjectsControl />

			{sorted.slice(0, visibleCount).map(subj => (
				<div
					key={subj.spec_id}
					className='bg-app-surface backdrop-blur-xl rounded-[24px] p-4 border border-app-border'
					style={{ boxShadow: 'var(--shadow-card)' }}
				>
					<div className='flex items-start justify-between gap-3 mb-4'>
						<h3 className='text-sm font-semibold text-app-text leading-snug'>
							{subj.spec_name}
						</h3>
						<div className='shrink-0 px-3 py-1.5 rounded-xl bg-comment-subtle border border-comment-border'>
							<span className='text-lg font-bold text-status-comment'>
								{subj.averageGrade > 0 ? subj.averageGrade.toFixed(1) : '—'}
							</span>
						</div>
					</div>

					<div className='-mx-4 overflow-x-auto scrollbar-none'>
						<div className='flex gap-3 px-4 pb-2 w-max'>
							{subj.entries.flatMap((entry, entryIdx) =>
								entry.flatMarks.map(({ type, value }, markIdx) => (
									<div
										key={`${subj.spec_id}-${entryIdx}-${type}-${markIdx}`}
										className='flex flex-col items-center gap-1.5'
									>
										<div
											className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
												type === 'final'
													? 'bg-[#A855F7]/20 border-[#A855F7]'
													: value >= 5
													? 'bg-checked-subtle border-status-checked'
													: value >= 4
													? 'bg-new-subtle border-status-new'
													: value >= 3
													? 'bg-pending-subtle border-status-pending'
													: 'bg-overdue-bg border-status-overdue'
											}`}
										>
											<span className='text-app-text font-bold text-lg'>
												{value}
											</span>
										</div>
										<div className='text-xs text-app-muted whitespace-nowrap'>
											{entry.date.slice(8, 10)}.{entry.date.slice(5, 7)}
										</div>
										<span
											className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap ${GRADE_TYPE_CONFIG[type].color}`}
										>
											{GRADE_TYPE_CONFIG[type].label}
										</span>
									</div>
								)),
							)}
						</div>
					</div>
				</div>
			))}

			{visibleCount < sorted.length && (
				<div ref={sentinelRef} className='space-y-3 pt-1'>
					{[0, 1].map(i => (
						<div
							key={i}
							className='bg-app-surface rounded-[24px] animate-pulse h-24'
						/>
					))}
				</div>
			)}
		</div>
	)
}
