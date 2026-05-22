import type { LessonItem } from '@/entities/schedule'
import { getGapBetweenLessons } from '@/entities/schedule/lib/scheduleGaps'
import { toMinutes, useCurrentMinutes } from '@/shared/hooks'
import { InlineImage } from '@/shared/ui'
import { getTodayString } from '@/shared/utils'
import { GapIndicator } from './GapIndicator'
import { LessonCard } from './LessonCard'

interface Props {
	lessons: LessonItem[]
	forDate?: string
	compact?: boolean
}

export function LessonList({ lessons, forDate, compact = false }: Props) {
	const nowMinutes = useCurrentMinutes()
	const todayStr = getTodayString()
	const isToday = !forDate || forDate === todayStr

	if (lessons.length === 0)
		return (
			<div className='flex flex-col items-center gap-3 py-4'>
				<InlineImage
					src='/homework.svg'
					alt='Нет пар'
					width={300}
					height={300}
				/>
				<p className='text-app-muted text-sm text-center'>Пар сегодня нет</p>
			</div>
		)

	const sorted = [...lessons].sort((a, b) => a.lesson - b.lesson)

	return (
		<ul className={`flex flex-col ${compact ? 'gap-1.5' : 'gap-3'}`}>
			{sorted.map((lesson, i) => (
				<li
					key={`${lesson.started_at}-${lesson.room}`}
					className='flex flex-col'
				>
					{i > 0 && (
						<GapIndicator
							gap={getGapBetweenLessons(sorted[i - 1], lesson)}
							compact={compact}
						/>
					)}
					<LessonCard
						lesson={lesson}
						compact={compact}
						isCurrent={
							isToday &&
							nowMinutes >= toMinutes(lesson.started_at) &&
							nowMinutes <= toMinutes(lesson.finished_at)
						}
					/>
				</li>
			))}
		</ul>
	)
}
