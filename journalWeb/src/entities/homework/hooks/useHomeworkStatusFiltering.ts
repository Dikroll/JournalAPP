import type { GroupData, HomeworkStatus } from '@/entities/homework'
import { STATUS_ORDER } from '@/entities/homework'
import { useMemo } from 'react'

/**
 * Result from homework status filtering
 */
export interface HomeworkStatusFilteringResult {
	/**
	 * List of statuses to display
	 */
	statusesToShow: HomeworkStatus[]
	/**
	 * Whether any items exist
	 */
	hasAnyItems: boolean
	/**
	 * Filtered groups by status
	 */
	filteredGroups: Array<{
		status: HomeworkStatus
		group: GroupData
	}>
}

/**
 * Custom hook for filtering homework by status
 * Extracts complex filtering logic from HomeworkStatusView
 *
 * @param byStatus - Homework items grouped by status
 * @param filterStatus - Currently selected status filter (null means show all)
 * @returns Filtered statuses and items
 */
export function useHomeworkStatusFiltering(
	byStatus: Record<HomeworkStatus, GroupData>,
	filterStatus: HomeworkStatus | null,
): HomeworkStatusFilteringResult {
	return useMemo(() => {
		// Determine which statuses to show
		const statusesToShow: HomeworkStatus[] = filterStatus
			? [filterStatus]
			: STATUS_ORDER

		// Check if any items exist
		const hasAnyItems = statusesToShow.some(
			s => (byStatus[s]?.items.length ?? 0) > 0,
		)

		// Build filtered groups
		const filteredGroups = statusesToShow
			.map(status => ({
				status,
				group: byStatus[status],
			}))
			.filter(({ group }) => group?.items.length ?? false)

		return {
			statusesToShow,
			hasAnyItems,
			filteredGroups,
		}
	}, [byStatus, filterStatus])
}
