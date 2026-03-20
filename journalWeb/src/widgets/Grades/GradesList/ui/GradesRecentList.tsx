import type { GradeEntryExpanded } from '@/entities/grades'
import { useLazyItems } from '@/shared/hooks'
import { formatDateRelative } from '@/shared/utils'
import { useEffect, useRef, useState } from 'react'
import { GradeEntryRow } from './GradeEntryRow'

interface Props {
	byDate: Array<{ date: string; items: GradeEntryExpanded[] }>
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
			<div className='text-sm font-medium text-app-muted px-1'>
				{formatDateRelative(date)}
			</div>
			<div
				ref={cardRef}
				className='bg-app-surface rounded-[24px] p-3 border border-app-border'
				style={{
					boxShadow: 'var(--shadow-card)',
					minHeight: visible ? undefined : estimatedHeight,
				}}
			>
				{visible &&
					items.map((entry, idx) => (
						<div
							key={`${entry.date}-${entry.lesson_number}-${entry.spec_id}-${idx}`}
						>
							{idx > 0 && <div className='border-t border-app-border my-1' />}
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
			<p className='text-app-muted text-sm text-center py-8'>Нет записей</p>
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
							className='bg-app-surface rounded-[24px] animate-pulse h-20'
						/>
					))}
				</div>
			)}
		</div>
	)
}
