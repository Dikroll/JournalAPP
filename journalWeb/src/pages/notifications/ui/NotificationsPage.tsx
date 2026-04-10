import {
	FALLBACK_CHANGELOG,
	getUnreadCount,
	useNotificationsStore,
} from '@/features/sendNotifications'
import type { ChangelogEntry } from '@/features/sendNotifications/model/store'
import { useAppUpdate, useAppUpdateStore } from '@/features/appUpdate'
import { RefreshNotificationsButton } from '@/features/refreshNotifications'
import { toChangelogFeedEntry } from '@/shared/lib/appRelease'
import { useSwipeBack } from '@/shared/hooks/useSwipeBack'
import { IconButton } from '@/shared/ui'
import { EvaluateLessonList } from '@/features/evaluateLesson'
import {
	ArrowLeft,
	ClipboardCheck,
	Download,
	Megaphone,
	Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChangelogTab } from './ChangelogTab'
import { ComingSoonTab } from './ComingSoonTab'

type Tab = 'changelog' | 'feedback' | 'news'

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
	{ key: 'changelog', label: 'Обновления', icon: <Sparkles size={13} /> },
	{ key: 'feedback', label: 'Оценки', icon: <ClipboardCheck size={13} /> },
	{ key: 'news', label: 'Новости', icon: <Megaphone size={13} /> },
]

export function NotificationsPage() {
	const navigate = useNavigate()
	const [activeTab, setActiveTab] = useState<Tab>('changelog')
	const { lastReadChangelogId, setLastRead } = useNotificationsStore()
	const latestRelease = useAppUpdateStore(s => s.latestRelease)
	const { serverInfo, status: updateStatus } = useAppUpdate()
	const openSheet = useAppUpdateStore(s => s.openSheet)

	useSwipeBack()

	const entries = useMemo<ChangelogEntry[]>(
		() => (latestRelease ? [toChangelogFeedEntry(latestRelease)] : FALLBACK_CHANGELOG),
		[latestRelease],
	)

	useEffect(() => {
		if (latestRelease && entries.length > 0) {
			setLastRead(entries[0].id)
		}
	}, [latestRelease, entries, setLastRead])

	const unread = getUnreadCount(lastReadChangelogId, entries)

	return (
		<div className='min-h-screen pb-28 text-app-text'>
			<div className='flex items-center gap-3 px-4 pt-4 pb-4'>
				<IconButton
					icon={<ArrowLeft size={18} />}
					onClick={() => navigate(-1)}
					size='md'
					shape='square'
					variant='surface'
					style={{ boxShadow: 'var(--shadow-card)' }}
					aria-label='Назад'
				/>
				<div className='flex items-center gap-2 flex-1'>
					<h1 className='text-xl font-bold text-app-text'>Уведомления</h1>
					{unread > 0 && activeTab !== 'changelog' && (
						<span className='text-xs font-bold px-1.5 py-0.5 rounded-full bg-brand text-white'>
							{unread}
						</span>
					)}
				</div>

				<RefreshNotificationsButton />
			</div>

			<div className='px-4 mb-4'>
				<div className='flex gap-2'>
					{TABS.map(({ key, label, icon }) => {
						const isActive = activeTab === key
						const showBadge =
							key === 'changelog' && unread > 0 && lastReadChangelogId !== null

						return (
							<button
								key={key}
								type='button'
								onClick={() => setActiveTab(key)}
								className='relative flex-1 flex items-center justify-center gap-1.5 h-10 rounded-2xl text-xs font-medium transition-all'
								style={{
									background: isActive
										? 'var(--color-surface-strong)'
										: 'var(--color-surface)',
									border: isActive
										? '1.5px solid var(--color-border-strong)'
										: '1px solid var(--color-border)',
									color: isActive
										? 'var(--color-text)'
										: 'var(--color-text-muted)',
									boxShadow: isActive ? 'var(--shadow-card)' : 'none',
								}}
							>
								{icon}
								{label}
								{showBadge && (
									<span className='absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center'>
										{unread}
									</span>
								)}
							</button>
						)
					})}
				</div>
			</div>

			<div className='px-4'>
				{activeTab === 'changelog' && serverInfo && (
					<button
						type='button'
						onClick={openSheet}
						disabled={updateStatus === 'downloading'}
						className='w-full mb-3 flex items-center justify-between px-4 py-3.5 rounded-[18px] border disabled:opacity-60'
						style={{
							background: 'linear-gradient(90deg, rgba(213,4,22,0.12), rgba(242,159,5,0.08))',
							borderColor: 'rgba(213,4,22,0.3)',
						}}
					>
						<div className='flex items-center gap-3'>
							<Download size={16} className='text-brand' />
							<div className='text-left'>
								<p className='text-sm font-semibold text-app-text'>
									Доступно обновление v{serverInfo.version}
								</p>
								<p className='text-xs text-app-muted'>
									{updateStatus === 'downloading' ? 'Скачивание...' : 'Нажмите чтобы скачать и установить'}
								</p>
							</div>
						</div>
						{updateStatus !== 'downloading' && (
							<span className='text-xs font-semibold text-brand'>Установить</span>
						)}
					</button>
				)}
				{activeTab === 'changelog' && <ChangelogTab entries={entries} />}
				{activeTab === 'feedback' && <EvaluateLessonList />}
				{activeTab === 'news' && <ComingSoonTab label='Новости колледжа' />}
			</div>
		</div>
	)
}
