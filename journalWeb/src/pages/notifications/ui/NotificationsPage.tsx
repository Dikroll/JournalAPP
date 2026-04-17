import {
	FALLBACK_CHANGELOG,
	getUnreadCount,
	useNotificationsStore,
} from '@/features/sendNotifications'
import type { ChangelogEntry } from '@/features/sendNotifications/model/store'
import { AppUpdateBanner, useAppUpdateStore } from '@/features/appUpdate'
import { RefreshNotificationsButton } from '@/features/refreshNotifications'
import { toChangelogFeedEntry } from '@/shared/lib/appRelease'
import { useSwipeBack } from '@/shared/hooks/useSwipeBack'
import type { Segment } from '@/shared/ui'
import { IconButton, PageHeader, SegmentedControl } from '@/shared/ui'
import {
	ChangelogTab,
	ComingSoonTab,
	EvaluateLessonList,
} from '@/widgets'
import {
	ArrowLeft,
	ClipboardCheck,
	Megaphone,
	Sparkles,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Tab = 'changelog' | 'feedback' | 'news'

const TABS: Segment<Tab>[] = [
	{ key: 'changelog', label: 'Обновления', icon: <Sparkles size={13} /> },
	{ key: 'feedback', label: 'Оценки', icon: <ClipboardCheck size={13} /> },
	{ key: 'news', label: 'Новости', icon: <Megaphone size={13} /> },
]

export function NotificationsPage() {
	const navigate = useNavigate()
	const [activeTab, setActiveTab] = useState<Tab>('changelog')
	const { lastReadChangelogId, setLastRead } = useNotificationsStore()
	const latestRelease = useAppUpdateStore(s => s.latestRelease)

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

	const tabsWithBadge = useMemo<Segment<Tab>[]>(() =>
		TABS.map(tab =>
			tab.key === 'changelog' && unread > 0 && lastReadChangelogId !== null
				? { ...tab, badge: unread }
				: tab,
		),
		[unread, lastReadChangelogId],
	)

	return (
		<div className='min-h-screen text-app-text pb-28'>
			<div className='p-4 space-y-4'>
				<div className='flex items-center gap-2'>
					<IconButton
						icon={<ArrowLeft size={18} />}
						onClick={() => navigate(-1)}
						size='md'
						shape='square'
						variant='surface'
						style={{ boxShadow: 'var(--shadow-card)' }}
						aria-label='Назад'
					/>

					<div className='flex-1'>
						<PageHeader
							title='Уведомления'
							actions={<RefreshNotificationsButton />}
						/>
					</div>
				</div>

				<SegmentedControl
					segments={tabsWithBadge}
					active={activeTab}
					onChange={setActiveTab}
				/>
			</div>

			<div className='px-4'>
				{activeTab === 'changelog' && (
					<>
						<AppUpdateBanner />
						<ChangelogTab entries={entries} />
					</>
				)}
				{activeTab === 'feedback' && <EvaluateLessonList />}
				{activeTab === 'news' && <ComingSoonTab label='Новости колледжа' />}
			</div>
		</div>
	)
}
