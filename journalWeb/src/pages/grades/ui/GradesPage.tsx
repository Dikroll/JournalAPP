import { useDashboardChartsStore } from '@/entities/dashboard'
import {
	useGrades,
	useGradesBySubject,
	useGradesGroups,
} from '@/entities/grades'
import { useSubjects } from '@/entities/subject'
import { RefreshGradesButton } from '@/features/refreshGrades'
import { SpecSelector } from '@/features/selectSpec'
import { ErrorView, PageHeader, SkeletonList } from '@/shared/ui'
import type { Tab } from '@/widgets'
import {
	GoalsSummaryCard,
	GradesCalendar,
	GradesExamList,
	GradesRecentList,
	GradesSubjectList,
	GradesSummary,
	GradesTabs,
} from '@/widgets'
import { useCallback, useMemo, useState } from 'react'

export function GradesPage() {
	const [activeTab, setActiveTab] = useState<Tab>('recent')
	const [selectedSpecId, setSelectedSpecId] = useState<number | null>(null)

	const { entries, status, error, refresh } = useGrades()
	const { bySubject: subjectCache, loadSubject } = useGradesBySubject()
	const { subjects: specList, status: specsStatus } = useSubjects()

	const progress = useDashboardChartsStore(s => s.progress)
	const attendance = useDashboardChartsStore(s => s.attendance)

	const handleSpecChange = useCallback(
		(spec: { id: number } | null) => {
			const id = spec?.id ?? null
			setSelectedSpecId(id)
			if (id != null) {
				setTimeout(() => loadSubject(id), 0)
			}
		},
		[loadSubject],
	)

	const selectedSubjectCache = useMemo(
		() => (selectedSpecId != null ? subjectCache[selectedSpecId] : null),
		[selectedSpecId, subjectCache],
	)

	const sourceEntries = useMemo(() => {
		if (selectedSubjectCache?.status === 'success')
			return selectedSubjectCache.entries
		if (selectedSpecId != null)
			return entries.filter(e => e.spec_id === selectedSpecId)
		return entries
	}, [selectedSubjectCache, selectedSpecId, entries])

	const { byDate, bySubject, byMonth } = useGradesGroups(
		sourceEntries,
		activeTab,
	)

	const isLoading = status === 'loading' || status === 'idle'
	const showCharts = progress.length > 0

	if (status === 'error' && entries.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center min-h-screen'>
				<ErrorView message={error ?? undefined} onRetry={refresh} />
			</div>
		)
	}

	return (
		<div className='min-h-screen text-app-text pb-28'>
			<div className='p-4 space-y-4'>
				<PageHeader title='Оценки' actions={<RefreshGradesButton />} />

				{showCharts && (
					<GradesSummary progress={progress} attendance={attendance} />
				)}

				<GoalsSummaryCard />

				<SpecSelector
					subjects={specList}
					selectedId={selectedSpecId}
					onChange={handleSpecChange}
					loading={specsStatus === 'loading'}
				/>

				<GradesTabs active={activeTab} onChange={setActiveTab} />
			</div>

			<div className='px-4'>
				{activeTab === 'exams' ? (
					<GradesExamList />
				) : isLoading ? (
					<SkeletonList count={3} height={80} />
				) : (
					<>
						{activeTab === 'recent' && <GradesRecentList byDate={byDate} />}
						{activeTab === 'calendar' && <GradesCalendar byMonth={byMonth} />}
						{activeTab === 'subjects' && (
							<GradesSubjectList bySubject={bySubject} />
						)}
					</>
				)}
			</div>
		</div>
	)
}
