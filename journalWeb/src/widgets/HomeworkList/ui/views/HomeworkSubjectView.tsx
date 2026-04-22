import type {
	GroupData,
	HomeworkStatus,
	SubjectData,
} from '@/entities/homework'
import { useHomeworkSubjectFiltering } from '@/entities/homework'
import type { Subject } from '@/entities/subject'
import { ChevronDown, RefreshCw } from 'lucide-react'
import { HomeworkCard } from '../card/HomeworkCard'
interface Props {
	bySubject: Record<string, Record<HomeworkStatus, GroupData>>
	filterStatus: HomeworkStatus | null
	selectedSpec: Subject | null
	specList: Subject[]
	subjects: Record<number, SubjectData>
	onLoadSubject: (specId: number, specName: string) => void
	onLoadMoreForSubject: (specId: number, statusKey: number) => void
}

export function HomeworkSubjectView({
	bySubject,
	filterStatus,
	selectedSpec,
	specList,
	subjects,
	onLoadSubject,
	onLoadMoreForSubject,
}: Props) {
	const { subjectViews } = useHomeworkSubjectFiltering(
		bySubject,
		filterStatus,
		selectedSpec,
		specList,
		subjects,
	)

	if (!subjectViews.length) {
		return <p className='text-app-muted text-sm'>Нет данных по предметам</p>
	}

	return (
		<div className='space-y-8'>
			{subjectViews.map(({ specName, specId, isLoadingSubject, sections }) => {
				return (
					<div key={specName}>
						<h2 className='text-base font-bold text-app-text mb-3'>
							{specName}
						</h2>

						{sections.map(
							({
								status,
								numKey,
								label,
								icon: Icon,
								textColor,
								displayItems,
								total,
								hasMore,
								subjectNotFetched,
							}) => (
								<div key={status} className='mb-4'>
									<h3 className='text-sm text-app-muted flex items-center gap-1.5 mb-2'>
										<Icon size={13} className={textColor} />
										{label}
										<span className='text-xs'>
											({total}
											{hasMore ? '+' : ''})
										</span>
									</h3>
									<div className='space-y-3'>
										{displayItems.map(hw => (
											<HomeworkCard key={hw.id} hw={hw} />
										))}
									</div>
									{hasMore && specId != null && (
										<button
											type='button'
											disabled={isLoadingSubject}
											onClick={e => {
												e.preventDefault()
												subjectNotFetched
													? onLoadSubject(specId, specName)
													: onLoadMoreForSubject(specId, numKey)
											}}
											className='w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-app-surface hover:bg-app-surface-hover border border-app-border rounded-2xl text-sm text-app-muted hover:text-app-text disabled:opacity-50'
										>
											{isLoadingSubject ? (
												<>
													<RefreshCw size={14} className='animate-spin' />{' '}
													Загрузка...
												</>
											) : subjectNotFetched ? (
												<>
													<ChevronDown size={16} /> Показать все ДЗ по предмету
												</>
											) : (
												<>
													<ChevronDown size={16} /> Показать ещё (
													{total - displayItems.length}+)
												</>
											)}
										</button>
									)}
								</div>
							),
						)}
					</div>
				)
			})}
		</div>
	)
}
