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
		<div className='px-4 pt-3 pb-2'>
			<div
				className='bg-white/5 backdrop-blur-xl rounded-[24px] px-5 py-5 border border-white/10'
				style={{ boxShadow: '0 4px 24px 0 rgba(0, 0, 0, 0.3)' }}
			>
				<div className='flex items-center justify-between'>
					<div className='flex-1'>
						<h1 className='text-base font-semibold text-[#F2F2F2] tracking-wide flex items-center gap-[2px] mb-1'>
							<span className='bg-[#D50416] text-white py-0.5 px-[5px] rounded-[3px] text-sm font-bold'>
								IT
							</span>
							<span className='relative text-[#F2F2F2] font-semibold'>
								TOP
								<span className='absolute -top-[1px] -right-[6px] w-[14px] h-[14px] border-t-2 border-r-2 border-[#D50416]' />
							</span>
							<span className='ml-[10px]'>COLLEGE</span>
						</h1>
						<p className='text-sm text-[#9CA3AF] mb-0.5'>{fullName}</p>
						<p className='text-xs text-[#9CA3AF]'>{groupName}</p>
					</div>

					{photoUrl && hydrated && (
						<Link to={pageConfig.profile}>
							<div className='flex items-center justify-center w-12 h-12 rounded-full overflow-hidden bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-[#F20519]/50'>
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
