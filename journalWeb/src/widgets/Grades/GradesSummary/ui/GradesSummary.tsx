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
				<div className='bg-white/5 rounded-[24px] p-4 border border-white/10'>
					<div className='flex items-center gap-1.5 mb-2'>
						<TrendingUp size={13} className='text-[#9CA3AF]' />
						<span className='text-xs text-[#9CA3AF]'>Средний балл</span>
					</div>
					<div className='text-2xl font-bold text-[#F2F2F2]'>
						{lastValue(progress) != null
							? lastValue(progress)!.toFixed(1)
							: '—'}
					</div>
				</div>
				<div className='bg-white/5 rounded-[24px] p-4 border border-white/10'>
					<div className='flex items-center gap-1.5 mb-2'>
						<CalendarDays size={13} className='text-[#9CA3AF]' />
						<span className='text-xs text-[#9CA3AF]'>Посещаемость</span>
					</div>
					<div className='text-2xl font-bold text-[#F2F2F2]'>
						{lastValue(attendance) != null ? `${lastValue(attendance)}%` : '—'}
					</div>
				</div>
			</div>
			<GradesCharts progress={progress} attendance={attendance} />
		</>
	)
}
