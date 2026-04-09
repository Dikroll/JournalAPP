import {
	FALLBACK_CHANGELOG,
	getUnreadCount,
	useNotificationsStore,
} from '@/features/sendNotifications'
import type { ChangelogEntry } from '@/features/sendNotifications/model/store'
import { useAppUpdateStore } from '@/features/appUpdate'
import { fetchLatestAppRelease, toChangelogFeedEntry } from '@/shared/lib/appRelease'
import { useSwipeBack } from '@/shared/hooks/useSwipeBack'
import {
	ArrowLeft,
	Bell,
	BookOpen,
	CheckCircle,
	Megaphone,
	RefreshCw,
	Sparkles,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Tab = 'changelog' | 'news' | 'reviews'

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
	{ key: 'changelog', label: 'Обновления', icon: <Sparkles size={13} /> },
	{ key: 'news', label: 'Новости', icon: <Megaphone size={13} /> },
	{ key: 'reviews', label: 'Отзывы', icon: <BookOpen size={13} /> },
]

function formatDate(iso: string): string {
	return new Date(iso).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}

function ChangelogTab({ entries }: { entries: ChangelogEntry[] }) {
	return (
		<div className='space-y-3'>
			{entries.map((entry, idx) => (
				<div
					key={entry.id}
					className='bg-app-surface rounded-[24px] p-4 border border-app-border'
					style={{ boxShadow: 'var(--shadow-card)' }}
				>
					<div className='flex items-center justify-between mb-3'>
						<div className='flex items-center gap-2'>
							<span
								className='text-xs font-bold px-2 py-0.5 rounded-full'
								style={{
									background:
										idx === 0
											? 'var(--color-brand-subtle)'
											: 'var(--color-surface-strong)',
									color:
										idx === 0
											? 'var(--color-brand)'
											: 'var(--color-text-muted)',
									border:
										idx === 0
											? '1px solid var(--color-brand-border)'
											: '1px solid var(--color-border)',
								}}
							>
								v{entry.version}
							</span>
							{idx === 0 && (
								<span className='text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'>
									Новое
								</span>
							)}
						</div>
						{entry.date && (
							<span className='text-xs text-app-muted'>
								{formatDate(entry.date)}
							</span>
						)}
					</div>

					<ul className='space-y-1.5'>
						{entry.items.map((item, i) => (
							<li key={i} className='flex items-start gap-2'>
								<CheckCircle
									size={13}
									className='text-status-checked flex-shrink-0 mt-0.5'
								/>
								<span className='text-sm text-app-text leading-snug'>
									{item}
								</span>
							</li>
						))}
					</ul>
				</div>
			))}
		</div>
	)
}

function ComingSoonTab({ label }: { label: string }) {
	return (
		<div className='flex flex-col items-center justify-center py-16 gap-3'>
			<div
				className='w-16 h-16 rounded-[20px] flex items-center justify-center'
				style={{
					background: 'var(--color-surface-strong)',
					border: '1px solid var(--color-border)',
				}}
			>
				<Bell size={24} className='text-app-muted' />
			</div>
			<p className='text-base font-semibold text-app-text'>{label}</p>
			<p className='text-sm text-app-muted text-center px-8'>
				Раздел появится в одном из следующих обновлений
			</p>
		</div>
	)
}

export function NotificationsPage() {
	const navigate = useNavigate()
	const [activeTab, setActiveTab] = useState<Tab>('changelog')
	const [refreshing, setRefreshing] = useState(false)
	const { lastReadChangelogId, setLastRead } = useNotificationsStore()
	const latestRelease = useAppUpdateStore(s => s.latestRelease)
	const setLatestRelease = useAppUpdateStore(s => s.setLatestRelease)

	useSwipeBack()

	const handleRefresh = useCallback(async () => {
		if (refreshing) return
		setRefreshing(true)
		try {
			const fresh = await fetchLatestAppRelease()
			if (fresh.version !== latestRelease?.version) {
				setLatestRelease(fresh)
			}
		} catch {
			// сеть недоступна — оставляем текущие данные
		} finally {
			setRefreshing(false)
		}
	}, [refreshing, latestRelease?.version, setLatestRelease])

	const entries = useMemo<ChangelogEntry[]>(
		() => (latestRelease ? [toChangelogFeedEntry(latestRelease)] : FALLBACK_CHANGELOG),
		[latestRelease],
	)

	useEffect(() => {
		if (entries.length > 0) {
			setLastRead(entries[0].id)
		}
	}, [entries, setLastRead])

	const unread = getUnreadCount(lastReadChangelogId, entries)

	return (
		<div className='min-h-screen pb-28 text-app-text'>
			<div className='flex items-center gap-3 px-4 pt-4 pb-4'>
				<button
					type='button'
					onClick={() => navigate(-1)}
					className='w-9 h-9 rounded-[14px] bg-app-surface border border-app-border flex items-center justify-center text-app-muted active:scale-95 transition-transform'
					style={{ boxShadow: 'var(--shadow-card)' }}
				>
					<ArrowLeft size={18} />
				</button>
				<div className='flex items-center gap-2 flex-1'>
					<h1 className='text-xl font-bold text-app-text'>Уведомления</h1>
					{unread > 0 && activeTab !== 'changelog' && (
						<span className='text-xs font-bold px-1.5 py-0.5 rounded-full bg-brand text-white'>
							{unread}
						</span>
					)}
				</div>

				{activeTab === 'changelog' && (
					<button
						type='button'
						onClick={handleRefresh}
						disabled={refreshing}
						className='w-9 h-9 rounded-[14px] bg-app-surface border border-app-border flex items-center justify-center text-app-muted active:scale-95 transition-transform disabled:opacity-50'
						style={{ boxShadow: 'var(--shadow-card)', WebkitTapHighlightColor: 'transparent' }}
					>
						<RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
					</button>
				)}
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
				{activeTab === 'changelog' && <ChangelogTab entries={entries} />}
				{activeTab === 'news' && <ComingSoonTab label='Новости колледжа' />}
				{activeTab === 'reviews' && (
					<ComingSoonTab label='Отзывы преподавателей' />
				)}
			</div>
		</div>
	)
}
