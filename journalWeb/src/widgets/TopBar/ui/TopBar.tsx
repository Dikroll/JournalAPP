import { useFeedbackStore } from '@/entities/feedback'
import { useUserStore } from '@/entities/user'
import {
	getUnreadCount,
	useNotificationsStore,
} from '@/features/sendNotifications'
import { useAppUpdateStore } from '@/features/appUpdate'
import { toChangelogFeedEntry } from '@/shared/lib/appRelease'
import { pageConfig } from '@/shared/config'
import { getCachedImageUrl } from '@/shared/lib'
import { getInitials, getShortName } from '@/shared/utils/nameUtils'
import { Bell } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function useStoreHydrated() {
	const [hydrated, setHydrated] = useState(() =>
		useUserStore.persist.hasHydrated(),
	)

	useEffect(() => {
		if (hydrated) return
		const unsub = useUserStore.persist.onFinishHydration(() =>
			setHydrated(true),
		)
		return unsub
	}, [hydrated])

	return hydrated
}

export const TopBar = memo(function TopBar() {
	const fullName = useUserStore(s => s.user?.full_name)
	const groupName = useUserStore(s => s.user?.group.name)
	const photoUrl = getCachedImageUrl(useUserStore(s => s.user?.photo_url))
	const hydrated = useStoreHydrated()
	const navigate = useNavigate()

	const { lastReadChangelogId } = useNotificationsStore()
	const latestRelease = useAppUpdateStore(s => s.latestRelease)
	const entries = latestRelease ? [toChangelogFeedEntry(latestRelease)] : undefined
	const unreadCount = getUnreadCount(lastReadChangelogId, entries)
	const pendingFeedbackCount = useFeedbackStore(s => s.pending.length)
	const hasBadge = unreadCount > 0 || pendingFeedbackCount > 0

	if (!fullName) return null

	const initials = getInitials(fullName)
	const shortName = getShortName(fullName)

	return (
		<div className='px-4 pt-2 pb-1'>
			<div
				className='flex items-center bg-app-surface backdrop-blur-xl rounded-[24px] px-5 py-4 border border-app-border'
				style={{ boxShadow: 'var(--shadow-card)' }}
			>
				<Link to={pageConfig.profile} className='flex-shrink-0 mr-5'>
					{photoUrl && hydrated ? (
						<div className='w-14 h-14 rounded-full overflow-hidden border border-app-border transition-all duration-300 hover:border-brand-border'>
							<img
								src={photoUrl}
								alt={fullName}
								width={56}
								height={56}
								className='w-full h-full object-cover'
							/>
						</div>
					) : (
						<div
							className='w-14 h-14 rounded-full flex items-center justify-center text-white text-base font-bold border border-app-border'
							style={{
								background: 'linear-gradient(135deg, #F20519 0%, #F29F05 100%)',
							}}
						>
							{initials}
						</div>
					)}
				</Link>

				<div className='flex-1 min-w-0 flex flex-col justify-between h-14'>
					<h1 className='text-base font-semibold text-app-text tracking-wide flex items-center gap-[2px] leading-none'>
						<span className='bg-brand text-white py-0.5 px-[5px] rounded-[3px] text-sm font-bold'>
							IT
						</span>
						<span className='relative text-app-text font-semibold'>
							TOP
							<span className='absolute -top-[1px] -right-[6px] w-[14px] h-[14px] border-t-2 border-r-2 border-brand' />
						</span>
						<span className='ml-[10px]'>COLLEGE</span>
					</h1>

					<p className='text-sm text-app-muted truncate leading-none'>
						{shortName}
					</p>

					<p className='text-xs text-app-muted truncate leading-none'>
						{groupName}
					</p>
				</div>

				<button
					type='button'
					onClick={() => navigate(pageConfig.notifications)}
					className='relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border border-app-border bg-app-surface transition-all duration-200 hover:bg-app-surface-hover hover:border-brand-border active:scale-95 ml-3'
				>
					<Bell size={18} className='text-app-muted' />
					{hasBadge && (
						<span className='absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-brand border-2' style={{ borderColor: 'var(--color-surface)' }} />
					)}
				</button>
			</div>
		</div>
	)
})
