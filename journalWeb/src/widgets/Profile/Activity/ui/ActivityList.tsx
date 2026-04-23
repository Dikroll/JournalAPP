import type { ActivityViewItem } from '@/entities/dashboard'
import { ErrorView, SkeletonList } from '@/shared/ui'
import type { RefObject } from 'react'
import { ActivityCard } from './ActivityCard'

interface Props {
	status: string
	activityCount: number
	viewItems: ActivityViewItem[]
	visibleItems: ActivityViewItem[]
	visibleCount: number
	isRefreshing: boolean
	isFilterPending: boolean
	sentinelRef: RefObject<HTMLDivElement | null>
}

export function ActivityList({
	status,
	activityCount,
	viewItems,
	visibleItems,
	visibleCount,
	isRefreshing,
	isFilterPending,
	sentinelRef,
}: Props) {
	return (
		<>
			{(isRefreshing || isFilterPending) && viewItems.length > 0 && (
				<div className='rounded-[20px] px-4 py-3 border border-app-border bg-app-surface/80 backdrop-blur-sm text-xs text-app-muted'>
					{isFilterPending
						? 'Переключаем список и подгружаем нужные записи.'
						: 'Обновляем историю в фоне. Пока показываем последнюю сохранённую версию.'}
				</div>
			)}

			{status === 'loading' && activityCount === 0 && (
				<SkeletonList count={6} height={88} />
			)}

			{status === 'error' && activityCount === 0 && (
				<ErrorView message='Не удалось загрузить историю изменений' />
			)}

			{viewItems.length === 0 && status !== 'loading' && (
				<div
					className='rounded-[24px] p-5 border border-app-border bg-app-surface'
					style={{ boxShadow: 'var(--shadow-card)' }}
				>
					<p className='text-sm font-semibold text-app-text'>
						Записей пока нет
					</p>
					<p className='text-xs text-app-muted mt-1'>
						Для выбранного типа начислений история пока пустая.
					</p>
				</div>
			)}

			{visibleItems.map((item, index) => (
				<ActivityCard key={item.key} item={item} index={index} />
			))}

			{visibleCount < viewItems.length && (
				<div ref={sentinelRef} className='space-y-3 pt-1'>
					{[0, 1, 2].map(i => (
						<div
							key={i}
							className='rounded-[24px] border border-app-border bg-app-surface animate-pulse h-24'
							style={{ boxShadow: 'var(--shadow-card)' }}
						/>
					))}
				</div>
			)}
		</>
	)
}
