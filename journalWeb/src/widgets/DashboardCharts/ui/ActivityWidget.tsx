import { useGrades } from '@/entities/grades'
import { BookOpen, UserCheck, XCircle } from 'lucide-react'
import { useMemo } from 'react'
import { Line, LineChart, XAxis, YAxis } from 'recharts'
import { useElementSize } from '@/shared/hooks'

const dayLabels = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

export function ActivityWidget({ className = '' }: { className?: string }) {
	const { entries } = useGrades()
	const { ref, width, height } = useElementSize()

	const data = useMemo(() => {
		const today = new Date()
		const dates = Array.from({ length: 7 }, (_, i) => {
			const d = new Date(today)
			d.setDate(d.getDate() - (6 - i))
			return d
		})

		let totalAttended = 0
		let totalGrades = 0
		let totalMissed = 0

		const chartData = dates.map(date => {
			const dateStr = date.toISOString().split('T')[0]
			const dayOfWeek = dayLabels[date.getDay()]
			
			// Filter entries for this date
			const dayEntries = entries.filter(e => e.date.split('T')[0] === dateStr)
			
			let dayAttended = 0
			let dayGrades = 0
			let dayMissed = 0
			
			for (const entry of dayEntries) {
				if (entry.attended === 'present' || entry.attended === 'late') {
					dayAttended++
					totalAttended++
				} else if (entry.attended === 'absent') {
					dayMissed++
					totalMissed++
				}
				
				if (entry.marks) {
					const marksCount = Object.values(entry.marks).length
					dayGrades += marksCount
					totalGrades += marksCount
				}
			}
			
			// Activity score: attendance count + grades count
			const activityScore = dayAttended + dayGrades
			
			return {
				label: dayOfWeek,
				value: activityScore,
				date: dateStr,
			}
		})

		return { chartData, totalAttended, totalGrades, totalMissed }
	}, [entries])

	return (
		<div
			className={`rounded-[20px] border border-app-border p-4 flex flex-col min-h-0 ${className}`}
			style={{
				background: 'var(--color-surface)',
				boxShadow: 'var(--shadow-card)',
				minHeight: '14rem',
			}}
		>
			<div className='flex items-center justify-between mb-4 shrink-0'>
				<h2 className='text-xs font-bold text-app-muted uppercase tracking-wider'>
					Активность за неделю
				</h2>
			</div>
			
			<div className="grid grid-cols-3 gap-2 mb-6 shrink-0">
				<div className="flex flex-col">
					<div className="flex items-center gap-1.5 mb-1">
						<div className="w-4 h-4 rounded bg-[#3B82F6]/20 flex items-center justify-center">
							<UserCheck size={10} className="text-[#3B82F6]" />
						</div>
						<span className="text-xs font-medium text-app-muted">Посещено</span>
					</div>
					<span className="text-sm font-bold text-[#3B82F6]">{data.totalAttended} <span className="text-xs font-normal text-app-muted">занятий</span></span>
				</div>
				<div className="flex flex-col">
					<div className="flex items-center gap-1.5 mb-1">
						<div className="w-4 h-4 rounded bg-[#10B981]/20 flex items-center justify-center">
							<BookOpen size={10} className="text-[#10B981]" />
						</div>
						<span className="text-xs font-medium text-app-muted">Оценок</span>
					</div>
					<span className="text-sm font-bold text-app-text">получено {data.totalGrades}</span>
				</div>
				<div className="flex flex-col">
					<div className="flex items-center gap-1.5 mb-1">
						<div className="w-4 h-4 rounded bg-[#F59E0B]/20 flex items-center justify-center">
							<XCircle size={10} className="text-[#F59E0B]" />
						</div>
						<span className="text-xs font-medium text-app-muted">Пропусков</span>
					</div>
					<span className="text-sm font-bold text-app-text">{data.totalMissed}</span>
				</div>
			</div>

			<div ref={ref} className='w-full flex-1 min-h-0 relative -mx-2 px-2'>
				{width > 0 && height > 0 && (
					<LineChart width={width} height={height} data={data.chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
						<XAxis 
							dataKey="label" 
							axisLine={false} 
							tickLine={false} 
							tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 500 }}
							dy={10}
						/>
						<YAxis hide domain={[0, (dataMax: number) => Math.max(dataMax, 5)]} />
						<Line
							type="monotone"
							dataKey="value"
							stroke="#3B82F6"
							strokeWidth={3}
							dot={{ r: 4, fill: '#3B82F6', strokeWidth: 0 }}
							activeDot={{ r: 6, fill: '#3B82F6', stroke: 'var(--color-surface)', strokeWidth: 2 }}
							isAnimationActive={true}
						/>
					</LineChart>
				)}
			</div>
		</div>
	)
}
