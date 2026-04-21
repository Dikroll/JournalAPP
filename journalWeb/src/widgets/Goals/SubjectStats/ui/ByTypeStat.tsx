import type { ByTypeItem } from '@/features/goalForecast'
import { gradeColor } from '@/shared/config'
import type { GradeType } from '@/shared/types'

interface Props {
	data: ByTypeItem[]
}

const LABEL: Record<GradeType, string> = {
	control: 'Контроль',
	homework: 'ДЗ',
	lab: 'Лабы',
	classwork: 'КР',
	practical: 'Практ',
	final: 'Зачёт',
}

export function ByTypeStat({ data }: Props) {
	if (data.length === 0) return null
	return (
		<div
			className='rounded-[20px] p-3'
			style={{
				background: 'var(--color-surface)',
				border: '1px solid var(--color-border)',
			}}
		>
			<div className='text-[10px] uppercase tracking-wider text-app-muted mb-1.5'>
				по типам оценок
			</div>
			{data.map(row => (
				<div
					key={row.type}
					className='flex items-center justify-between text-[12px] py-0.5'
				>
					<span>
						{LABEL[row.type]}{' '}
						<span className='text-app-muted text-[10px]'>· {row.count}</span>
					</span>
					<strong style={{ color: gradeColor(row.avg) }}>
						{row.avg.toFixed(1)}
					</strong>
				</div>
			))}
		</div>
	)
}
