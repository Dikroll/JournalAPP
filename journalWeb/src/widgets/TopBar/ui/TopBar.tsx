import { useUserStore } from '@/entities/user'
import { pageConfig } from '@/shared/config'
import { getCachedImageUrl } from '@/shared/lib'
import { memo, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

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
	}, [])
	return hydrated
}

export const TopBar = memo(function TopBar() {
	const fullName = useUserStore(s => s.user?.full_name)
	const groupName = useUserStore(s => s.user?.group.name)
	const photoUrl = getCachedImageUrl(useUserStore(s => s.user?.photo_url))
	const hydrated = useStoreHydrated()

	if (!fullName) return null

	return (
		<div className='px-4 pt-2 pb-2'>
			<div
				className='bg-app-surface backdrop-blur-xl rounded-[24px] px-5 py-5 border border-app-border'
				style={{ boxShadow: 'var(--shadow-card)' }}
			>
				<div className='flex items-center justify-between'>
					<div className='flex-1'>
						<h1 className='text-base font-semibold text-app-text tracking-wide flex items-center gap-[2px] mb-1'>
							<span className='bg-brand text-white py-0.5 px-[5px] rounded-[3px] text-sm font-bold'>
								IT
							</span>
							<span className='relative text-app-text font-semibold'>
								TOP
								<span className='absolute -top-[1px] -right-[6px] w-[14px] h-[14px] border-t-2 border-r-2 border-brand' />
							</span>
							<span className='ml-[10px]'>COLLEGE</span>
						</h1>

						<p className='text-sm text-app-muted mb-0.5'>{fullName}</p>
						<p className='text-xs text-app-muted'>{groupName}</p>
					</div>

					{photoUrl && hydrated && (
						<Link to={pageConfig.profile}>
							<div className='flex items-center justify-center w-12 h-12 rounded-full overflow-hidden bg-app-surface border border-app-border transition-all duration-300 hover:bg-app-surface-hover hover:border-brand-border'>
								<img
									src={photoUrl}
									alt={fullName}
									width={48}
									height={48}
									loading='eager'
									decoding='async'
									className='w-full h-full object-cover'
								/>
							</div>
						</Link>
					)}
				</div>
			</div>
		</div>
	)
})
