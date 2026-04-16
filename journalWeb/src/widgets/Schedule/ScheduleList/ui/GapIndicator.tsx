import {
	type GapInfo,
	formatGapMinutes,
} from '@/entities/schedule/lib/scheduleGaps'
import { Hourglass, UtensilsCrossed } from 'lucide-react'

interface Props {
	gap: GapInfo
}

export function GapIndicator({ gap }: Props) {
	if (gap.minutes <= 0 || gap.type === 'break') return null

	const isLunch = gap.type === 'lunch'
	const Icon = isLunch ? UtensilsCrossed : Hourglass
	const label = isLunch ? 'Обед' : 'Окно'
	const color = isLunch ? '#F59E0B' : '#8B5CF6'

	return (
		<div className='flex items-center gap-2 px-4 py-1.5'>
			<div className='flex-1 h-px' style={{ background: `${color}30` }} />
			<div
				className='flex items-center gap-1.5 rounded-full px-2.5 py-1 border'
				style={{
					background: `${color}10`,
					borderColor: `${color}25`,
				}}
			>
				<Icon size={10} style={{ color }} />
				<span className='text-[10px] font-medium' style={{ color }}>
					{label} · {formatGapMinutes(gap.minutes)}
				</span>
			</div>
			<div className='flex-1 h-px' style={{ background: `${color}30` }} />
		</div>
	)
}

