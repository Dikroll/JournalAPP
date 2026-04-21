import type { Distribution } from '@/features/goalForecast'

interface Props {
	data: Distribution
}

const COLORS: Record<2 | 3 | 4 | 5, string> = {
	2: '#e03535',
	3: '#f0a020',
	4: '#4d9ef7',
	5: '#22c98a',
}

export function DistributionStat({ data }: Props) {
	const max = Math.max(data[2], data[3], data[4], data[5], 1)
	return (
		<div
			className='rounded-[20px] p-3'
			style={{
				background: 'var(--color-surface)',
				border: '1px solid var(--color-border)',
			}}
		>
			<div className='text-[10px] uppercase tracking-wider text-app-muted mb-2'>
				распределение
			</div>
			<div className='flex gap-1.5 items-end' style={{ height: 54 }}>
				{([2, 3, 4, 5] as const).map(g => (
					<div key={g} className='flex-1 flex flex-col items-center gap-1'>
						<div
							className='w-full rounded'
							style={{
								height: `${(data[g] / max) * 100}%`,
								minHeight: 2,
								background: COLORS[g],
							}}
						/>
						<div className='text-[9px] text-app-muted'>
							{data[g]}×{g}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
