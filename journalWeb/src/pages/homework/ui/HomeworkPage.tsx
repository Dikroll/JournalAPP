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
import { BookOpen, LayoutGrid, LayoutList, List } from 'lucide-react'
import { useEffect, useState } from 'react'

type GroupBy = 'status' | 'subject'
export type HomeworkViewMode = 'list' | 'photo'

const GROUP_TABS: { key: GroupBy; label: string; icon: React.ReactNode }[] = [
	{ key: 'status', label: 'По статусу', icon: <LayoutList size={13} /> },
	{ key: 'subject', label: 'По предметам', icon: <BookOpen size={13} /> },
]

const VIEW_TABS: {
	key: HomeworkViewMode
	label: string
	icon: React.ReactNode
}[] = [
	{ key: 'list', label: 'Список', icon: <List size={13} /> },
	{ key: 'photo', label: 'Фото', icon: <LayoutGrid size={13} /> },
]

export function HomeworkPage() {
	const [groupBy, setGroupBy] = useState<GroupBy>('status')
	const [selectedSpec, setSelectedSpec] = useState<Subject | null>(null)
	const [viewMode, setViewMode] = useState<HomeworkViewMode>('list')
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
				<p className='text-app-muted'>Загрузка...</p>
			</div>
		)
	}

	if (status === 'error') {
		return (
			<div className='flex flex-col items-center justify-center min-h-screen gap-4'>
				<p className='text-status-overdue'>{error}</p>
				<RefreshHomeworkButton className='flex items-center gap-2 px-4 py-2.5 bg-app-surface rounded-2xl text-app-text text-sm border border-app-border transition-colors' />
			</div>
		)
	}

	return (
		<div className='min-h-screen text-app-text pb-28'>
			<div className='p-4 space-y-3'>
				<div className='flex items-center justify-between'>
					<h1 className='text-2xl font-bold text-app-text'>Домашние задания</h1>
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
					{GROUP_TABS.map(({ key, label, icon }) => (
						<button
							key={key}
							type='button'
							onClick={() => setGroupBy(key)}
							className={`flex-1 flex items-center justify-center gap-1.5 h-10 px-2 rounded-2xl text-xs font-medium transition-colors whitespace-nowrap ${
								groupBy === key
									? 'bg-app-surface-strong text-app-text border border-app-border-strong'
									: 'bg-app-surface text-app-muted border border-app-border hover:text-app-text hover:bg-app-surface-hover'
							}`}
						>
							{icon}
							{label}
						</button>
					))}
				</div>

				<div className='flex gap-0 bg-app-surface border border-app-border rounded-2xl p-1'>
					{VIEW_TABS.map(({ key, label, icon }) => (
						<button
							key={key}
							type='button'
							onClick={() => setViewMode(key)}
							className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-medium transition-all duration-200 ${
								viewMode === key
									? 'bg-app-surface-active text-app-text shadow-sm'
									: 'text-app-muted hover:text-app-text'
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
						viewMode={viewMode}
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
						viewMode={viewMode}
						onLoadSubject={loadSubject}
						onLoadMoreForSubject={loadMoreForSubject}
					/>
				)}
			</div>
		</div>
	)
}