import { useMemo, useState } from 'react'

/**
 * State for an expandable list
 */
export interface UseExpandableListResult<T> {
	/**
	 * Items visible based on expanded state
	 */
	visible: T[]
	/**
	 * Whether the list is expanded
	 */
	expanded: boolean
	/**
	 * Toggle expanded state
	 */
	toggleExpanded: () => void
	/**
	 * Whether more items can be shown
	 */
	canExpand: boolean
	/**
	 * Number of hidden items
	 */
	remaining: number
}

/**
 * Custom hook for managing expandable lists
 * Eliminates repeated expand/collapse logic across components
 *
 * Used in: ReviewList, HomeworkSubjectView, and various list components
 *
 * @param items - All items in the list
 * @param initialShowCount - Number of items to show initially
 */
export function useExpandableList<T>(
	items: T[],
	initialShowCount: number = 3,
): UseExpandableListResult<T> {
	const [expanded, setExpanded] = useState(false)

	const { visible, canExpand, remaining } = useMemo(() => {
		const canExpand = items.length > initialShowCount
		const visible = expanded ? items : items.slice(0, initialShowCount)
		const remaining = items.length - initialShowCount

		return { visible, canExpand, remaining }
	}, [items, expanded, initialShowCount])

	return {
		visible,
		expanded,
		toggleExpanded: () => setExpanded(prev => !prev),
		canExpand,
		remaining,
	}
}
