import {
	useHomework,
	useHomeworkBySubject,
	useHomeworkGroups,
} from '@/entities/homework'
import type { Subject } from '@/entities/subject'
import { useSubjects } from '@/entities/subject'
import { RefreshHomeworkButton } from '@/features/refreshHomework'
import { SpecSelector } from '@/features/selectSpec'
import { ErrorView, PageHeader, SkeletonList } from '@/shared/ui'
import {
	HomeworkCountersBar,
	HomeworkStatusView,
	HomeworkSubjectView,
} from '@/widgets'
import { BookOpen, LayoutList } from 'lucide-react'
import { useEffect, useState } from 'react'

type GroupBy = 'status' | 'subject'

const GROUP_TABS: { key: GroupBy; label: string; icon: React.ReactNode }[] = [
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
			<div className='p-4'>
				<SkeletonList count={5} height={120} />
			</div>
		)
	}

	if (status === 'error') {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<ErrorView message={error ?? undefined} />
			</div>
		)
	}

	return (
		<div className='min-h-screen text-app-text pb-28'>
			<div className='p-4 space-y-3'>
				<PageHeader
					title='Домашние задания'
					actions={<RefreshHomeworkButton />}
				/>

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
							onClick={e => {
								e.preventDefault()
								setGroupBy(key)
							}}
							className={`flex-1 flex items-center justify-center gap-1.5 h-10 px-2 rounded-2xl text-xs font-medium whitespace-nowrap ${
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
