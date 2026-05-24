import type {
	GroupData,
	HomeworkItemWithStatus,
	HomeworkStatus,
	SubjectData,
} from '@/entities/homework'
import { STATUS_CONFIG, STATUS_KEY_MAP, STATUS_ORDER } from '@/entities/homework'
import type { Subject } from '@/entities/subject'
import { useMemo } from 'react'

export interface HomeworkSubjectSection {
	status: HomeworkStatus
	numKey: number
	label: string
	textColor: string
	icon: (typeof STATUS_CONFIG)[HomeworkStatus]['icon']
	displayItems: HomeworkItemWithStatus[]
	total: number
	hasMore: boolean
	subjectNotFetched: boolean
}

export interface HomeworkSubjectViewModel {
	specName: string
	specId: number | null
	isLoadingSubject: boolean
	sections: HomeworkSubjectSection[]
}

export interface HomeworkSubjectFilteringResult {
	subjectViews: HomeworkSubjectViewModel[]
}

/**
 * Custom hook for filtering homework by subject and status
 * Extracts complex nested filtering logic from HomeworkSubjectView
 *
 * Handles:
 * - Deciding between store items vs base items
 * - Managing expand/collapse state per subject
 * - Counting available items
 * - Status-based filtering
 *
 * @param bySubject - Homework items grouped by subject then status
 * @param filterStatus - Currently selected status filter
 * @param selectedSpec - Currently selected subject (null = show all)
 * @param specList - List of available subjects
 * @param subjects - Subject data from store
 * @returns Filtered subject names, statuses, and display items
 */
export function useHomeworkSubjectFiltering(
	bySubject: Record<string, Record<HomeworkStatus, GroupData>>,
	filterStatus: HomeworkStatus | null,
	selectedSpec: Subject | null,
	specList: Subject[],
	subjects: Record<number, SubjectData>,
): HomeworkSubjectFilteringResult {
	return useMemo(() => {
		const statusesToShow: HomeworkStatus[] = filterStatus
			? [filterStatus]
			: STATUS_ORDER

		const specNames = selectedSpec
			? Object.keys(bySubject).filter(n => n === selectedSpec.name)
			: Object.keys(bySubject).sort((a, b) => a.localeCompare(b, 'ru'))

		const subjectViews: HomeworkSubjectViewModel[] = []

		for (const specName of specNames) {
			const statusGroups = bySubject[specName]
			const knownSpec = specList.find(s => s.name === specName)
			const specId = knownSpec?.id ?? null
			const subjectData = specId != null ? subjects[specId] : null
			const isLoadingSubject = subjectData?.status === 'loading'
			const sections: HomeworkSubjectSection[] = []

			for (const status of statusesToShow) {
				const numKey = STATUS_KEY_MAP[status]
				const storeItems = subjectData?.items?.[numKey] ?? []
				const baseItems = statusGroups[status]?.items ?? []

				const displayItems: HomeworkItemWithStatus[] =
					storeItems.length > 0
						? storeItems.map(hw => ({ ...hw, statusKey: status }))
						: baseItems

				if (!displayItems.length) continue

				const storeTotal = subjectData?.counters?.[status] ?? null
				const total = storeTotal ?? displayItems.length
				const isExpanded = subjectData?.expandedStatuses.has(numKey) ?? false
				const subjectNotFetched =
					subjectData == null || subjectData.loadedAt == null
				const hasMore =
					subjectNotFetched || (!isExpanded && displayItems.length < total)
				const { label, icon, textColor } = STATUS_CONFIG[status]

				sections.push({
					status,
					numKey,
					label,
					textColor,
					icon,
					displayItems,
					total,
					hasMore,
					subjectNotFetched,
				})
			}

			if (!sections.length) continue

			subjectViews.push({
				specName,
				specId,
				isLoadingSubject,
				sections,
			})
		}

		return {
			subjectViews,
		}
	}, [bySubject, filterStatus, selectedSpec, specList, subjects])
}
