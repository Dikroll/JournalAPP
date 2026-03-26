import type { ChartPoint } from '@/entities/dashboard'
import { lastValue } from '@/entities/dashboard'
import { GradesCharts } from '@/widgets'
import { CalendarDays, TrendingUp } from 'lucide-react'

interface Props {
	progress: ChartPoint[]
	attendance: ChartPoint[]
}

export function GradesSummary({ progress, attendance }: Props) {
	return (
		<>
			<div className='grid grid-cols-2 gap-3'>
				<div className='bg-app-surface rounded-[24px] p-4 border border-app-border'>
					<div className='flex items-center gap-1.5 mb-2'>
						<TrendingUp size={13} className='text-app-muted' />
						<span className='text-xs text-app-muted'>Средний балл</span>
					</div>
					<div className='text-2xl font-bold text-app-text'>
						{lastValue(progress) != null
							? lastValue(progress)!.toFixed(1)
							: '—'}
					</div>
				</div>
				<div className='bg-app-surface rounded-[24px] p-4 border border-app-border'>
					<div className='flex items-center gap-1.5 mb-2'>
						<CalendarDays size={13} className='text-app-muted' />
						<span className='text-xs text-app-muted'>Посещаемость</span>
					</div>
					<div className='text-2xl font-bold text-app-text'>
						{lastValue(attendance) != null ? `${lastValue(attendance)}%` : '—'}
					</div>
				</div>
			</div>
			<GradesCharts progress={progress} attendance={attendance} />
		</>
	)
}
