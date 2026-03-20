import type {
	GroupData,
	HomeworkItemWithStatus,
	HomeworkStatus,
	SubjectData,
} from '@/entities/homework'
import {
	STATUS_CONFIG,
	STATUS_KEY_MAP,
	STATUS_ORDER,
} from '@/entities/homework'
import type { Subject } from '@/entities/subject'
import { HomeworkCard } from '@/widgets'
import { ChevronDown, RefreshCw } from 'lucide-react'
import { HomeworkCardPhoto } from '../card/HomeworkCardPhoto'
import type { HomeworkViewMode } from '../shared/HomeworkToggleView'

interface Props {
	bySubject: Record<string, Record<HomeworkStatus, GroupData>>
	filterStatus: HomeworkStatus | null
	selectedSpec: Subject | null
	specList: Subject[]
	subjects: Record<number, SubjectData>
	viewMode: HomeworkViewMode
	onLoadSubject: (specId: number, specName: string) => void
	onLoadMoreForSubject: (specId: number, statusKey: number) => void
}

export function HomeworkSubjectView({
	bySubject,
	filterStatus,
	selectedSpec,
	specList,
	subjects,
	viewMode,
	onLoadSubject,
	onLoadMoreForSubject,
}: Props) {
	const statusesToShow = filterStatus ? [filterStatus] : STATUS_ORDER
	const CardComponent = viewMode === 'photo' ? HomeworkCardPhoto : HomeworkCard

	const specNames = selectedSpec
		? Object.keys(bySubject).filter(n => n === selectedSpec.name)
		: Object.keys(bySubject).sort((a, b) => a.localeCompare(b, 'ru'))

	if (!specNames.length) {
		return <p className='text-app-muted text-sm'>Нет данных по предметам</p>
	}

	return (
		<div className='space-y-8'>
			{specNames.map(specName => {
				const statusGroups = bySubject[specName]
				const knownSpec = specList.find(s => s.name === specName)
				const specId = knownSpec?.id ?? null
				const subjectData = specId != null ? subjects[specId] : null
				const isLoadingSubject = subjectData?.status === 'loading'

				const hasAny = statusesToShow.some(
					s => (statusGroups[s]?.items.length ?? 0) > 0,
				)
				if (!hasAny) return null

				return (
					<div key={specName}>
						<h2 className='text-base font-bold text-app-text mb-3'>
							{specName}
						</h2>

						{statusesToShow.map(s => {
							const numKey = STATUS_KEY_MAP[s]
							const storeItems = subjectData?.items[numKey] ?? []
							const baseItems = statusGroups[s]?.items ?? []

							const displayItems: HomeworkItemWithStatus[] =
								storeItems.length > 0
									? storeItems.map(hw => ({ ...hw, statusKey: s }))
									: baseItems

							if (!displayItems.length) return null

							const storeTotal = subjectData?.counters?.[s] ?? null
							const total = storeTotal ?? displayItems.length
							const isExpanded =
								subjectData?.expandedStatuses.has(numKey) ?? false
							const subjectNotFetched =
								subjectData == null || subjectData.loadedAt == null
							const hasMore =
								subjectNotFetched ||
								(!isExpanded && displayItems.length < total)
							const { label, icon: Icon, textColor } = STATUS_CONFIG[s]

							return (
								<div key={s} className='mb-4'>
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
											<CardComponent key={hw.id} hw={hw as any} />
										))}
									</div>
									{hasMore && specId != null && (
										<button
											type='button'
											disabled={isLoadingSubject}
											onClick={() =>
												subjectNotFetched
													? onLoadSubject(specId, specName)
													: onLoadMoreForSubject(specId, numKey)
											}
											className='w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-app-surface hover:bg-app-surface-hover border border-app-border rounded-2xl text-sm text-app-muted hover:text-app-text transition-colors disabled:opacity-50'
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
							)
						})}
					</div>
				)
			})}
		</div>
	)
}
