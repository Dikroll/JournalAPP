import type { GradeEntryExpanded } from '@/entities/grades/hooks/useGradesGroups'
import { useLazyItems } from '@/shared/hooks/useLazyItems'
import { useEffect, useRef, useState } from 'react'
import { GradeEntryRow } from './GradeEntryRow'

interface Props {
	byDate: Array<{ date: string; items: GradeEntryExpanded[] }>
}

function formatDate(dateStr: string): string {
	const date = new Date(`${dateStr}T00:00:00`)
	const today = new Date()
	const yesterday = new Date(today)
	yesterday.setDate(today.getDate() - 1)
	if (date.toDateString() === today.toDateString()) return 'Сегодня'
	if (date.toDateString() === yesterday.toDateString()) return 'Вчера'
	return date.toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		weekday: 'short',
	})
}

function DateCard({
	date,
	items,
}: {
	date: string
	items: GradeEntryExpanded[]
}) {
	const [visible, setVisible] = useState(false)
	const cardRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const el = cardRef.current
		if (!el) return
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true)
					observer.disconnect()
				}
			},
			{ rootMargin: '300px' },
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	const estimatedHeight = 56 + items.length * 68

	return (
		<div className='space-y-2'>
			<div className='text-sm font-medium text-[#9CA3AF] px-1'>
				{formatDate(date)}
			</div>
			<div
				ref={cardRef}
				className='bg-white/5 rounded-[24px] p-3 border border-white/10'
				style={{
					boxShadow: '0 4px 24px 0 rgba(0,0,0,0.3)',
					minHeight: visible ? undefined : estimatedHeight,
				}}
			>
				{visible &&
					items.map((entry, idx) => (
						<div
							key={`${entry.date}-${entry.lesson_number}-${entry.spec_id}-${idx}`}
						>
							{idx > 0 && <div className='border-t border-white/5 my-1' />}
							<GradeEntryRow entry={entry} />
						</div>
					))}
			</div>
		</div>
	)
}

export function GradesRecentList({ byDate }: Props) {
	const { visibleCount, sentinelRef } = useLazyItems(byDate.length, 20, 15)

	if (byDate.length === 0) {
		return (
			<p className='text-[#9CA3AF] text-sm text-center py-8'>Нет записей</p>
		)
	}

	return (
		<div className='space-y-4'>
			{byDate.slice(0, visibleCount).map(({ date, items }) => (
				<DateCard key={date} date={date} items={items} />
			))}

			{visibleCount < byDate.length && (
				<div ref={sentinelRef} className='space-y-3 pt-1'>
					{[0, 1].map(i => (
						<div
							key={i}
							className='bg-white/5 rounded-[24px] animate-pulse h-20'
						/>
					))}
				</div>
			)}
		</div>
	)
}
