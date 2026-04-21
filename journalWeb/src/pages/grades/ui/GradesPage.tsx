import { useDashboardChartsStore } from '@/entities/dashboard'
import {
	useGrades,
	useGradesBySubject,
	useGradesGroups,
} from '@/entities/grades'
import { useSubjects } from '@/entities/subject'
import { RefreshGradesButton } from '@/features/refreshGrades'
import { SpecSelector } from '@/features/selectSpec'
import { pageConfig } from '@/shared/config'
import { ErrorView, PageHeader, SkeletonList } from '@/shared/ui'
import type { Tab } from '@/widgets'
import {
	GradesCalendar,
	GradesExamList,
	GradesRecentList,
	GradesSubjectList,
	GradesSummary,
	GradesTabs,
} from '@/widgets'
import { Target } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function GradesPage() {
	const [activeTab, setActiveTab] = useState<Tab>('recent')
	const [selectedSpecId, setSelectedSpecId] = useState<number | null>(null)
	const navigate = useNavigate()

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
				<PageHeader
					title='Оценки'
					actions={
						<>
							<button
								type='button'
								onClick={() => navigate(pageConfig.goals)}
								aria-label='Цели'
								className='rounded-full'
								style={{
									width: 36,
									height: 36,
									background: 'var(--color-surface)',
									border: '1px solid var(--color-border)',
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							>
								<Target size={18} />
							</button>
							<RefreshGradesButton />
						</>
					}
				/>

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
