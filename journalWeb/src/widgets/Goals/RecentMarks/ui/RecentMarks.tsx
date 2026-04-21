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
	control: 'Контроль',
	homework: 'ДЗ',
	lab: 'Лаб',
	classwork: 'КР',
	practical: 'Практ',
	final: 'Зачёт',
}

function fmtDate(iso: string): string {
	const [, m, d] = iso.split('-')
	return `${Number(d)}.${m}`
}

export function RecentMarks({ items }: Props) {
	if (items.length === 0) return null
	return (
		<div>
			<div className='text-[10px] uppercase tracking-wider text-app-muted mt-3 mb-2 px-1'>
				Последние
			</div>
			<div
				className='rounded-[20px] px-3.5 py-2'
				style={{
					background: 'var(--color-surface)',
					border: '1px solid var(--color-border)',
				}}
			>
				{items.map((m, i) => (
					<div
						key={`${m.date}-${m.type}-${i}`}
						className='flex justify-between items-center py-1.5 text-[12px]'
					>
						<span>
							{fmtDate(m.date)}
							<span className='text-app-muted'>
								{' '}
								· {TYPE_LABEL[m.type as GradeType] ?? m.type}
							</span>
						</span>
						<strong style={{ color: gradeColor(m.value) }}>{m.value}</strong>
					</div>
				))}
			</div>
		</div>
	)
}
