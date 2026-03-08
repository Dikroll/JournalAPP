import type { SubjectStats } from '@/entities/grades/hooks/useGradesGroups'
import { GRADE_TYPE_CONFIG } from '@/entities/grades/hooks/useGradesGroups'
import { useLazyItems } from '@/shared/hooks/useLazyItems'

interface Props {
	bySubject: SubjectStats[]
}

export function GradesSubjectList({ bySubject }: Props) {
	const { visibleCount, sentinelRef } = useLazyItems(bySubject.length)

	if (bySubject.length === 0) {
		return <p className='text-[#9CA3AF] text-sm text-center py-8'>Нет данных</p>
	}

	const visible = bySubject.slice(0, visibleCount)

	return (
		<div className='space-y-3'>
			{visible.map(subj => (
				<div
					key={subj.spec_id}
					className='bg-white/5 backdrop-blur-xl rounded-[24px] p-4 border border-white/10'
					style={{ boxShadow: '0 4px 24px 0 rgba(0,0,0,0.3)' }}
				>
					<div className='flex items-start justify-between gap-3 mb-4'>
						<h3 className='text-sm font-semibold text-[#F2F2F2] leading-snug'>
							{subj.spec_name}
						</h3>
						<div className='shrink-0 px-3 py-1.5 rounded-xl bg-[#F29F05]/20 border border-[#F29F05]/30'>
							<span className='text-lg font-bold text-[#F29F05]'>
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
														? 'bg-[#10B981]/20 border-[#10B981]'
														: value >= 4
															? 'bg-[#3B82F6]/20 border-[#3B82F6]'
															: value >= 3
																? 'bg-[#F59E0B]/20 border-[#F59E0B]'
																: 'bg-[#DC2626]/20 border-[#DC2626]'
											}`}
										>
											<span className='text-white font-bold text-lg'>
												{value}
											</span>
										</div>
										<div className='text-xs text-[#9CA3AF] whitespace-nowrap'>
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

			{visibleCount < bySubject.length && (
				<div ref={sentinelRef} className='space-y-3 pt-1'>
					{[0, 1].map(i => (
						<div
							key={i}
							className='bg-white/5 rounded-[24px] animate-pulse h-24'
						/>
					))}
				</div>
			)}
		</div>
	)
}
