import { lastValue } from '@/entities/dashboard/hooks/useDashboardCharts'
import { useDashboardChartsStore } from '@/entities/dashboard/model/store'
import { useGrades } from '@/entities/grades/hooks/useGrades'
import { useGradesBySubject } from '@/entities/grades/hooks/useGradesBySubject'
import { useGradesGroups } from '@/entities/grades/hooks/useGradesGroups'
import { useSubjects } from '@/entities/subject/hooks/useSubjects'
import { SpecSelector } from '@/features/selectSpec/ui/SpecSelector'
import { GradesCharts } from '@/widgets/Grades/GradesCharts/ui/GradesCharts'
import { GradesCalendar } from '@/widgets/Grades/GradesList/ui/GradesCalendar'
import { GradesRecentList } from '@/widgets/Grades/GradesList/ui/GradesRecentList'
import { GradesSubjectList } from '@/widgets/Grades/GradesList/ui/GradesSubjectList'
import { RefreshCw } from 'lucide-react'
import { useState } from 'react'

type Tab = 'recent' | 'calendar' | 'subjects'

const TABS: { key: Tab; label: string }[] = [
	{ key: 'recent', label: 'Недавние' },
	{ key: 'calendar', label: 'Календарь' },
	{ key: 'subjects', label: 'По предметам' },
]

export function GradesPage() {
	const [activeTab, setActiveTab] = useState<Tab>('recent')
	const [isRefreshing, setIsRefreshing] = useState(false)
	const [selectedSpecId, setSelectedSpecId] = useState<number | null>(null)

	const { entries, status, error, refresh } = useGrades()
	const { bySubject: subjectCache, loadSubject } = useGradesBySubject()
	const { subjects: specList, status: specsStatus } = useSubjects()

	// Читаем стор напрямую — без лишнего fetch
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

	const showCharts = chartsStatus === 'success' && progress.length > 0

	return (
		<div className='min-h-screen text-[#F2F2F2] pb-28'>
			<div className='p-4 space-y-4'>
				<div className='flex items-center justify-between'>
					<h1 className='text-2xl font-bold'>Оценки</h1>
					<button
						type='button'
						onClick={handleRefresh}
						className='flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-2xl text-[#9CA3AF] hover:text-[#F2F2F2] text-sm border border-white/10 transition-colors'
					>
						<RefreshCw
							size={15}
							className={isRefreshing ? 'animate-spin' : ''}
						/>
						Обновить
					</button>
				</div>

				{showCharts && (
					<>
						<div className='grid grid-cols-2 gap-3'>
							<div className='bg-white/5 rounded-[24px] p-4 border border-white/10'>
								<div className='text-sm text-[#9CA3AF] mb-1'>Средний балл</div>
								<div className='text-3xl font-bold text-[#F20519]'>
									{lastValue(progress) != null
										? lastValue(progress)!.toFixed(1)
										: '—'}
								</div>
							</div>
							<div className='bg-white/5 rounded-[24px] p-4 border border-white/10'>
								<div className='text-sm text-[#9CA3AF] mb-1'>Посещаемость</div>
								<div className='text-3xl font-bold text-[#F29F05]'>
									{lastValue(attendance) != null
										? `${lastValue(attendance)}%`
										: '—'}
								</div>
							</div>
						</div>
						<GradesCharts progress={progress} attendance={attendance} />
					</>
				)}

				<SpecSelector
					subjects={specList}
					selectedId={selectedSpecId}
					onChange={handleSpecChange}
					loading={specsStatus === 'loading'}
				/>

				<div className='flex gap-2'>
					{TABS.map(({ key, label }) => (
						<button
							key={key}
							type='button'
							onClick={() => setActiveTab(key)}
							className={`flex-1 px-3 py-2.5 rounded-2xl text-sm font-medium transition-colors ${
								activeTab === key
									? 'bg-[#F29F05] text-white'
									: 'bg-white/5 text-[#F2F2F2] border border-white/10'
							}`}
						>
							{label}
						</button>
					))}
				</div>
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
