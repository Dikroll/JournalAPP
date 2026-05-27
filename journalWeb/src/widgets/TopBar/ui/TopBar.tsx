import { useTopBarViewModel } from '@/features/navigation/hooks/useTopBarViewModel'
import { pageConfig } from '@/shared/config'
import { Avatar, BrandLogo } from '@/shared/ui'
import { Bell } from 'lucide-react'
import { memo } from 'react'
import { Link } from 'react-router-dom'

export const TopBar = memo(function TopBar() {
	const viewModel = useTopBarViewModel()

	if (!viewModel) return null

	const {
		fullName,
		groupName,
		photoUrl,
		hydrated,
		shortName,
		hasBadge,
	} = viewModel

	return (
		<div className='px-4 pt-2 pb-1'>
			<div
				className='flex items-center bg-app-surface backdrop-blur-xl rounded-[24px] px-5 py-4 border border-app-border'
				style={{ boxShadow: 'var(--shadow-card)' }}
			>
				<Link to={pageConfig.profile} className='flex-shrink-0 mr-5'>
					<Avatar
						photoUrl={hydrated ? photoUrl : null}
						fullName={fullName}
						size={56}
						className="transition-all duration-300 hover:border-brand-border"
					/>
				</Link>

				<div className='flex-1 min-w-0 flex flex-col justify-between h-14'>
					<BrandLogo />

					<p className='text-sm text-app-muted truncate leading-none'>
						{shortName}
					</p>

					<p className='text-xs text-app-muted truncate leading-none'>
						{groupName}
					</p>
				</div>

				<Link
					to={pageConfig.notifications}
					className='relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border border-app-border bg-app-surface transition-all duration-200 hover:bg-app-surface-hover hover:border-brand-border active:scale-95 ml-3'
				>
					<Bell size={18} className='text-app-muted' />
					{hasBadge && (
						<span className='absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-brand border-2' style={{ borderColor: 'var(--color-surface)' }} />
					)}
				</Link>
			</div>
		</div>
	)
})
