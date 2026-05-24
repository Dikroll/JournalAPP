import {
	buildActivityViewItems,
	filterActivityEntries,
	resolveActivityFilter,
} from '../lib/activityView'
import type { ActivityFilter } from '../lib/activityView'
import { useLazyItems } from '@/shared/hooks'
import { startTransition, useDeferredValue, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useDashboardActivity } from './useDashboardActivity'

interface ProfileActivityLocationState {
	initialFilter?: ActivityFilter
}

export function useDashboardActivityViewModel() {
	const location = useLocation()
	const locationState = location.state as ProfileActivityLocationState | null
	const { activity, status, isRefreshing, refreshActivity } = useDashboardActivity()
	const [activeFilter, setActiveFilter] = useState<ActivityFilter>(
		resolveActivityFilter(locationState?.initialFilter),
	)
	const deferredFilter = useDeferredValue(activeFilter)

	const filteredActivity = useMemo(
		() => filterActivityEntries(activity, deferredFilter),
		[activity, deferredFilter],
	)
	const viewItems = useMemo(
		() => buildActivityViewItems(filteredActivity),
		[filteredActivity],
	)
	const { visibleCount, sentinelRef } = useLazyItems(viewItems.length, 24, 24)
	const visibleItems = useMemo(
		() => viewItems.slice(0, visibleCount),
		[viewItems, visibleCount],
	)

	return {
		status,
		isRefreshing,
		refreshActivity,
		activityCount: activity.length,
		activeFilter,
		isFilterPending: activeFilter !== deferredFilter,
		setActiveFilter: (next: ActivityFilter) => {
			startTransition(() => {
				setActiveFilter(next)
			})
		},
		viewItems,
		visibleItems,
		visibleCount,
		sentinelRef,
	}
}
