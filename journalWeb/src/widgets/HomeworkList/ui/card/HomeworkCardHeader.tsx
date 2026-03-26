import type { HomeworkItemWithStatus } from '@/entities/homework'
import { STATUS_CONFIG } from '@/entities/homework'
import { GraduationCap } from 'lucide-react'

interface Props {
	hw: HomeworkItemWithStatus
	gradeStyle: { badge: string } | null
	grade: number | null
}

export function HomeworkCardHeader({ hw, gradeStyle, grade }: Props) {
	const config = STATUS_CONFIG[hw.statusKey]
	const StatusIcon = config.icon
	const isChecked = hw.statusKey === 'checked'

	return (
		<div className='flex items-start justify-between mb-3'>
			<div className='flex-1 min-w-0'>
				<div className='flex items-center gap-2 mb-1'>
					<StatusIcon
						size={16}
						className={`${config.textColor} flex-shrink-0`}
					/>
					<span
						className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.textColor} bg-app-surface`}
					>
						{config.label}
					</span>
				</div>
				<h3 className='text-base font-semibold text-app-text leading-snug'>
					{hw.spec_name}
				</h3>
				<p className='text-sm text-app-muted line-clamp-2 mt-0.5'>
					{hw.theme ?? 'Без темы'}
				</p>
				<div className='flex items-center gap-1.5 mt-1 text-[12px]'>
					<GraduationCap size={13} className='text-app-text flex-shrink-0' />
					<span className='text-app-text truncate'>{hw.teacher}</span>
				</div>
			</div>

			{isChecked && grade != null && (
				<div
					className={`ml-3 flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold border ${
						gradeStyle!.badge
					}`}
				>
					{grade}
				</div>
			)}
		</div>
	)
}
