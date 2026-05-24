import type { Distribution } from '@/features/goalForecast'
import { GRADE_COLOR } from '@/shared/config'
import { Cell, Pie, PieChart } from 'recharts'

interface Props {
	data: Distribution
}

const RING_SIZE = 168
const INNER_RADIUS = 56
const OUTER_RADIUS = 80

function gradeNoun(n: number): string {
	const mod10 = n % 10
	const mod100 = n % 100
	if (mod10 === 1 && mod100 !== 11) return 'оценка'
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'оценки'
	return 'оценок'
}

export function DistributionStat({ data }: Props) {
	const total = data[1] + data[2] + data[3] + data[4] + data[5]

	const chartData = ([5, 4, 3, 2, 1] as const)
		.map(g => ({ grade: g, value: data[g] }))
		.filter(d => d.value > 0)

	const topGrade = chartData.length > 0 ? chartData[0].grade : null
	const goodCount = data[4] + data[5]
	const goodPct = total > 0 ? Math.round((goodCount / total) * 100) : 0

	return (
		<div
			className='rounded-[22px] p-5'
			style={{
				background: 'var(--color-surface)',
				border: '1px solid var(--color-border)',
				boxShadow: 'var(--shadow-card)',
			}}
		>
			<div className='flex items-start justify-between mb-4'>
				<div>
					<div className='text-[16px] font-semibold text-app-text'>
						Распределение оценок
					</div>
					<div className='text-[12px] text-app-muted mt-1'>
						каких оценок сколько получил
					</div>
				</div>
				{total > 0 && goodCount > 0 && (
					<div className='text-right shrink-0'>
						<div
							className='text-[16px] font-semibold tabular-nums'
							style={{ color: GRADE_COLOR[5] }}
						>
							{goodPct}%
						</div>
						<div className='text-[12px] text-app-muted'>4 и 5</div>
					</div>
				)}
			</div>

			{total === 0 ? (
				<div className='text-[13px] text-app-muted py-10 text-center'>
					Пока нет оценок — как появятся, покажу разбивку.
				</div>
			) : (
				<>
					<div className='flex justify-center mb-4'>
						<div
							className='relative'
							style={{ width: RING_SIZE, height: RING_SIZE }}
						>
							<PieChart width={RING_SIZE} height={RING_SIZE}>
								<Pie
									data={chartData}
									dataKey='value'
									nameKey='grade'
									cx='50%'
									cy='50%'
									innerRadius={INNER_RADIUS}
									outerRadius={OUTER_RADIUS}
									paddingAngle={chartData.length > 1 ? 3 : 0}
									cornerRadius={6}
									stroke='none'
									isAnimationActive={false}
								>
									{chartData.map(d => (
										<Cell key={d.grade} fill={GRADE_COLOR[d.grade]} />
									))}
								</Pie>
							</PieChart>
							<div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
								<span className='text-[28px] font-bold text-app-text leading-none tabular-nums'>
									{total}
								</span>
								<span className='text-[12px] text-app-muted mt-1.5'>
									{gradeNoun(total)}
								</span>
							</div>
						</div>
					</div>

					<div className='space-y-2.5'>
						{([5, 4, 3, 2, 1] as const).map(g => {
							const count = data[g]
							const pct = total > 0 ? (count / total) * 100 : 0
							const isTop = g === topGrade
							return (
								<div key={g} className='flex items-center gap-3'>
									<div
										className='flex items-center gap-2 shrink-0'
										style={{ width: 44 }}
									>
										<span
											className='w-2.5 h-2.5 rounded-full'
											style={{ background: GRADE_COLOR[g] }}
										/>
										<span
											className='text-[14px] font-semibold tabular-nums'
											style={{ color: GRADE_COLOR[g] }}
										>
											{g}
										</span>
									</div>
									<div
										className='flex-1 rounded-full overflow-hidden'
										style={{
											height: 8,
											background: 'var(--color-surface-strong)',
										}}
									>
										<div
											className='h-full rounded-full transition-all'
											style={{
												width: `${pct}%`,
												background: GRADE_COLOR[g],
												opacity: count === 0 ? 0 : isTop ? 1 : 0.85,
											}}
										/>
									</div>
									<div
										className='text-right tabular-nums shrink-0'
										style={{ width: 64 }}
									>
										<span className='text-[14px] font-semibold text-app-text'>
											{count}
										</span>
										<span className='text-[12px] text-app-muted ml-1.5'>
											{Math.round(pct)}%
										</span>
									</div>
								</div>
							)
						})}
					</div>
				</>
			)}
		</div>
	)
}
