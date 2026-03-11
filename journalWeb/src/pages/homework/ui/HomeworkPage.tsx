import {
	useHomework,
	useHomeworkBySubject,
	useHomeworkGroups,
} from '@/entities/homework'
import type { Subject } from '@/entities/subject'
import { useSubjects } from '@/entities/subject'
import { RefreshHomeworkButton } from '@/features/refreshHomework'
import { SpecSelector } from '@/features/selectSpec'
import {
	HomeworkCountersBar,
	HomeworkStatusView,
	HomeworkSubjectView,
} from '@/widgets'
import { BookOpen, LayoutList } from 'lucide-react'
import { useEffect, useState } from 'react'

type GroupBy = 'status' | 'subject'

const TABS: { key: GroupBy; label: string; icon: React.ReactNode }[] = [
	{ key: 'status', label: 'По статусу', icon: <LayoutList size={13} /> },
	{ key: 'subject', label: 'По предметам', icon: <BookOpen size={13} /> },
]

export function HomeworkPage() {
	const [groupBy, setGroupBy] = useState<GroupBy>('status')
	const [selectedSpec, setSelectedSpec] = useState<Subject | null>(null)
	const { subjects: specList, status: specsStatus } = useSubjects()

	const {
		items,
		expandedStatuses,
		counters,
		status,
		error,
		filterStatus,
		loadMore,
		setFilter,
	} = useHomework()

	const { byStatus, bySubject } = useHomeworkGroups(
		items,
		expandedStatuses,
		counters,
	)
	const { subjects, loadSubject, loadMoreForSubject } = useHomeworkBySubject()

	useEffect(() => {
		if (!selectedSpec) return
		loadSubject(selectedSpec.id, selectedSpec.name)
	}, [selectedSpec?.id])

	if (status === 'loading') {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<p className='text-[#9CA3AF]'>Загрузка...</p>
			</div>
		)
	}

	if (status === 'error') {
		return (
			<div className='flex flex-col items-center justify-center min-h-screen gap-4'>
				<p className='text-[#DC2626]'>{error}</p>
				<RefreshHomeworkButton className='flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-2xl text-[#F2F2F2] text-sm border border-white/20 transition-colors' />
			</div>
		)
	}

	return (
		<div className='min-h-screen text-[#F2F2F2] pb-28'>
			<div className='p-4 space-y-4'>
				<div className='flex items-center justify-between'>
					<h1 className='text-2xl font-bold'>Домашние задания</h1>
					<RefreshHomeworkButton />
				</div>

				{counters && (
					<HomeworkCountersBar
						counters={counters}
						activeFilter={filterStatus}
						onFilter={setFilter}
					/>
				)}

				<div className='flex gap-2'>
					{TABS.map(({ key, label, icon }) => (
						<button
							key={key}
							type='button'
							onClick={() => setGroupBy(key)}
							className={`flex-1 flex items-center justify-center gap-1.5 h-10 px-2 rounded-2xl text-xs font-medium transition-colors whitespace-nowrap ${
								groupBy === key
									? 'bg-white/15 text-[#F2F2F2] border border-white/20'
									: 'bg-white/5 text-[#6B7280] border border-white/10 hover:text-[#F2F2F2] hover:bg-white/8'
							}`}
						>
							{icon}
							{label}
						</button>
					))}
				</div>

				<SpecSelector
					subjects={specList}
					selectedId={selectedSpec?.id ?? null}
					onChange={setSelectedSpec}
					loading={specsStatus === 'loading'}
				/>
			</div>

			<div className='px-4'>
				{groupBy === 'status' ? (
					<HomeworkStatusView
						byStatus={byStatus}
						filterStatus={filterStatus}
						selectedSpec={selectedSpec}
						subjectData={selectedSpec ? subjects[selectedSpec.id] : undefined}
						onLoadMore={loadMore}
						onLoadMoreForSubject={loadMoreForSubject}
					/>
				) : (
					<HomeworkSubjectView
						bySubject={bySubject}
						filterStatus={filterStatus}
						selectedSpec={selectedSpec}
						specList={specList}
						subjects={subjects}
						onLoadSubject={loadSubject}
						onLoadMoreForSubject={loadMoreForSubject}
					/>
				)}
			</div>
		</div>
	)
}
