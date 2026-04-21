import type { ByTypeItem } from '@/features/goalForecast'
import { gradeColor } from '@/shared/config'
import type { GradeType } from '@/shared/types'

interface Props {
	data: ByTypeItem[]
}

const LABEL: Record<GradeType, string> = {
	control: 'Контрольная',
	homework: 'Домашняя',
	lab: 'Лабораторная',
	classwork: 'Классная',
	practical: 'Практическая',
	final: 'Зачёт',
}

function gradeNoun(n: number): string {
	const mod10 = n % 10
	const mod100 = n % 100
	if (mod10 === 1 && mod100 !== 11) return 'оценка'
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'оценки'
	return 'оценок'
}

export function ByTypeStat({ data }: Props) {
	if (data.length === 0) return null
	return (
		<div
			className='rounded-[20px] p-4'
			style={{
				background: 'var(--color-surface)',
				border: '1px solid var(--color-border)',
				boxShadow: 'var(--shadow-card)',
			}}
		>
			<div className='text-[12px] uppercase tracking-wider text-app-muted mb-3'>
				по типам оценок
			</div>
			<div className='flex flex-wrap gap-2'>
				{data.map(row => {
					const color = gradeColor(row.avg)
					return (
						<div
							key={row.type}
							className='flex-1 rounded-[14px] p-3 flex items-center justify-between gap-3'
							style={{
								background: 'var(--color-surface-strong)',
								minWidth: 140,
							}}
						>
							<div className='min-w-0'>
								<div className='text-[13px] font-semibold text-app-text truncate leading-none'>
									{LABEL[row.type]}
								</div>
								<div className='text-[11px] text-app-text opacity-70 mt-1.5'>
									{row.count} {gradeNoun(row.count)}
								</div>
							</div>
							<span
								className='text-[22px] font-bold tabular-nums leading-none shrink-0'
								style={{ color }}
							>
								{row.avg.toFixed(1)}
							</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}
