import { STATUS_KEY_MAP, STATUS_MAP, STATUS_ORDER } from '@/entities/homework'
import { useMemo } from 'react'
import { PREVIEW_SIZE } from '../model/store'
import type {
	GroupData,
	HomeworkCounters,
	HomeworkItem,
	HomeworkItemWithStatus,
	HomeworkStatus,
} from '../model/types'

export function useHomeworkGroups(
	items: Record<number, HomeworkItem[]>,
	expandedStatuses: Set<number>,
	counters: HomeworkCounters | null,
) {
	const flat = useMemo(() => {
		return Object.entries(items).flatMap(([statusNum, list]) => {
			const statusKey = STATUS_MAP[Number(statusNum)] ?? 'pending'
			return list.map(hw => ({ ...hw, statusKey }))
		})
	}, [items])

	const byStatus = useMemo(() => {
		return STATUS_ORDER.reduce(
			(acc, s) => {
				const numKey = STATUS_KEY_MAP[s]
				const all = flat.filter(hw => hw.statusKey === s)
				const isExpanded = expandedStatuses.has(numKey)
				const loadedCount = all.length
				const realTotal = counters ? counters[s] : loadedCount
				const visibleItems =
					isExpanded || loadedCount > PREVIEW_SIZE
						? all
						: all.slice(0, PREVIEW_SIZE)

				const hasMore = !isExpanded && loadedCount < realTotal

				acc[s] = {
					items: visibleItems,
					total: realTotal,
					isExpanded,
					hasMore,
				}
				return acc
			},
			{} as Record<HomeworkStatus, GroupData>,
		)
	}, [flat, expandedStatuses, counters])

	const bySubject = useMemo(() => {
		const raw: Record<
			string,
			Partial<Record<HomeworkStatus, HomeworkItemWithStatus[]>>
		> = {}

		for (const hw of flat) {
			if (!raw[hw.spec_name]) raw[hw.spec_name] = {}
			if (!raw[hw.spec_name][hw.statusKey]) raw[hw.spec_name][hw.statusKey] = []
			raw[hw.spec_name][hw.statusKey]!.push(hw)
		}

		const result: Record<string, Record<HomeworkStatus, GroupData>> = {}

		for (const subject of Object.keys(raw)) {
			result[subject] = {} as Record<HomeworkStatus, GroupData>
			for (const s of STATUS_ORDER) {
				const all = raw[subject][s] ?? []
				const numKey = STATUS_KEY_MAP[s]
				const isExpanded = expandedStatuses.has(numKey)
				const loadedCount = all.length

				const visibleItems =
					isExpanded || loadedCount > PREVIEW_SIZE
						? all
						: all.slice(0, PREVIEW_SIZE)

				result[subject][s] = {
					items: visibleItems,
					total: loadedCount,
					isExpanded,
					hasMore: false,
				}
			}
		}

		return result
	}, [flat, expandedStatuses])

	return { flat, byStatus, bySubject }
}
