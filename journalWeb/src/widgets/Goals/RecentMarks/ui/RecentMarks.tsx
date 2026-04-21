import { gradeColor } from '@/shared/config'
import type { GradeType } from '@/shared/types'

interface RecentMark {
	date: string
	type: string
	value: number
}

interface Props {
	items: RecentMark[]
}

const TYPE_LABEL: Record<GradeType, string> = {
	control: 'контрольная',
	homework: 'домашняя',
	lab: 'лабораторная',
	classwork: 'классная',
	practical: 'практическая',
	final: 'зачёт',
}

function fmtDate(iso: string): string {
	const [, m, d] = iso.split('-')
	return `${Number(d)}.${m}`
}

export function RecentMarks({ items }: Props) {
	if (items.length === 0) return null
	return (
		<div>
			<div className='text-[13px] uppercase tracking-wider text-app-muted mt-4 mb-2 px-1'>
				Последние
			</div>
			<div
				className='rounded-[20px] p-4'
				style={{
					background: 'var(--color-surface)',
					border: '1px solid var(--color-border)',
					boxShadow: 'var(--shadow-card)',
				}}
			>
				<div className='grid grid-cols-2 gap-2'>
					{items.slice(0, 6).map((m, i) => {
						const color = gradeColor(m.value)
						const label = TYPE_LABEL[m.type as GradeType] ?? m.type
						return (
							<div
								key={`${m.date}-${m.type}-${i}`}
								className='rounded-[14px] p-3 flex items-center justify-between gap-2'
								style={{ background: 'var(--color-surface-strong)' }}
							>
								<div className='min-w-0'>
									<div className='text-[13px] font-semibold text-app-text tabular-nums leading-none'>
										{fmtDate(m.date)}
									</div>
									<div className='text-[11px] text-app-text opacity-70 mt-1.5 truncate'>
										{label}
									</div>
								</div>
								<span
									className='text-[22px] font-bold tabular-nums leading-none shrink-0'
									style={{ color }}
								>
									{m.value}
								</span>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
