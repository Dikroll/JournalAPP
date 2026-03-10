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
import type { Tab } from '@/widgets'
import {
	GradesCalendar,
	GradesHeader,
	GradesRecentList,
	GradesSubjectList,
	GradesSummary,
	GradesTabs,
} from '@/widgets'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

export function GradesPage() {
	const [activeTab, setActiveTab] = useState<Tab>('recent')
	const [isRefreshing, setIsRefreshing] = useState(false)
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

	const handleRefresh = () => {
		setIsRefreshing(true)
		refresh()
		setTimeout(() => setIsRefreshing(false), 1000)
	}

	const isLoading = status === 'loading' || status === 'idle'
	const showCharts = chartsStatus === 'success' && progress.length > 0

	if (status === 'error') {
		return (
			<div className='flex flex-col items-center justify-center min-h-screen gap-4'>
				<p className='text-[#DC2626]'>{error}</p>
				<button
					type='button'
					onClick={handleRefresh}
					className='flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-2xl text-[#F2F2F2] text-sm border border-white/20 transition-colors'
				>
					<RefreshCw size={16} /> Повторить
				</button>
			</div>
		)
	}

	return (
		<div className='min-h-screen text-[#F2F2F2] pb-28'>
			<div className='p-4 space-y-4'>
				<GradesHeader isRefreshing={isRefreshing} onRefresh={handleRefresh} />

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
				{isLoading ? (
					<div className='space-y-3'>
						{[0, 1, 2].map(i => (
							<div
								key={i}
								className='bg-white/5 rounded-[24px] animate-pulse h-20'
							/>
						))}
					</div>
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
