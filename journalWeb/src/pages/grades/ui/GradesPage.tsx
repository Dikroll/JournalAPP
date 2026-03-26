import {
	useDashboardCharts,
	useDashboardChartsStore,
} from '@/entities/dashboard'
import {
	useGrades,
	useGradesBySubject,
	useGradesGroups,
} from '@/entities/grades'
import { useSubjects } from '@/entities/subject'
import { SpecSelector } from '@/features/selectSpec'
import { ErrorView, SkeletonList } from '@/shared/ui'
import type { Tab } from '@/widgets'
import {
	GradesCalendar,
	GradesExamList,
	GradesHeader,
	GradesRecentList,
	GradesSubjectList,
	GradesSummary,
	GradesTabs,
} from '@/widgets'
import { useState } from 'react'

export function GradesPage() {
	const [activeTab, setActiveTab] = useState<Tab>('recent')
	const [selectedSpecId, setSelectedSpecId] = useState<number | null>(null)

	const { entries, status, error, refresh } = useGrades()
	const { bySubject: subjectCache, loadSubject } = useGradesBySubject()
	const { subjects: specList, status: specsStatus } = useSubjects()

	useDashboardCharts()
	const progress = useDashboardChartsStore(s => s.progress)
	const attendance = useDashboardChartsStore(s => s.attendance)
	const chartsStatus = useDashboardChartsStore(s => s.status)

	const handleSpecChange = (spec: { id: number } | null) => {
		const id = spec?.id ?? null
		setSelectedSpecId(id)
		if (id != null) loadSubject(id)
	}

	const selectedSubjectCache =
		selectedSpecId != null ? subjectCache[selectedSpecId] : null
	const sourceEntries =
		selectedSubjectCache?.status === 'success'
			? selectedSubjectCache.entries
			: selectedSpecId != null
			? entries.filter(e => e.spec_id === selectedSpecId)
			: entries

	const { byDate, bySubject, byMonth } = useGradesGroups(sourceEntries)

	const isLoading = status === 'loading' || status === 'idle'
	const showCharts = chartsStatus === 'success' && progress.length > 0

	if (status === 'error') {
		return (
			<div className='flex flex-col items-center justify-center min-h-screen'>
				<ErrorView message={error ?? undefined} onRetry={refresh} />
			</div>
		)
	}

	return (
		<div className='min-h-screen text-[#F2F2F2] pb-28'>
			<div className='p-4 space-y-4'>
				<GradesHeader />

				{showCharts && (
					<GradesSummary progress={progress} attendance={attendance} />
				)}

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
