import { useProfileDetails } from '@/entities/profile'
import { AccountSwitcher } from '@/features/changeUser'
import { ClearCacheSheet } from '@/features/clearCache'
import { resetAllAppState } from '@/shared/lib'
import { pageConfig } from '@/shared/config'
import { useSwipeBack } from '@/shared/hooks/useSwipeBack'
import { ErrorView, PageHeader, SkeletonList } from '@/shared/ui'
import {
	ProfileAvatar,
	ProfileInfoCard,
	ProfilePaymentCard,
	ProfileRelativesCard,
} from '@/widgets'
import { ArrowLeft, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function ProfileDetailsPage() {
	const navigate = useNavigate()
	const { details, status } = useProfileDetails()
	const [showSwitcher, setShowSwitcher] = useState(false)
	const [showClearCache, setShowClearCache] = useState(false)

	useSwipeBack()

	const handleAddAccount = () => {
		navigate(`${pageConfig.login}?addAccount=true`)
	}

	return (
		<div className='pb-6'>
			<div className='flex items-center gap-2 px-4 pt-4 pb-4'>
				<button
					type='button'
					onClick={() => navigate(-1)}
					className='w-9 h-9 rounded-[14px] bg-app-surface border border-app-border flex items-center justify-center text-app-muted active:scale-95 transition-transform'
					style={{
						boxShadow: 'var(--shadow-card)',
						WebkitTapHighlightColor: 'transparent',
					}}
				>
					<ArrowLeft size={18} />
				</button>

				<div className='flex-1'>
					<PageHeader title='Детали профиля' />
				</div>

				<button
					type='button'
					onClick={() => setShowSwitcher(true)}
					className='flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-app-surface border border-app-border text-app-muted text-xs hover:bg-app-surface-hover'
					style={{
						boxShadow: 'var(--shadow-card)',
						minHeight: 36,
						WebkitTapHighlightColor: 'transparent',
					}}
				>
					<Users size={14} />
					Аккаунты
				</button>

				<button
					type='button'
					onClick={() => setShowClearCache(true)}
					className='flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-app-surface border border-app-border text-app-muted text-xs hover:bg-app-surface-hover'
					style={{
						boxShadow: 'var(--shadow-card)',
						minHeight: 36,
						WebkitTapHighlightColor: 'transparent',
					}}
				>
					<Trash2 size={14} />
					Кэш
				</button>
			</div>

			<div className='px-4 space-y-3'>
				{status === 'loading' && <SkeletonList count={3} height={120} />}
				{status === 'error' && (
					<ErrorView message='Не удалось загрузить данные' />
				)}
				{details && (
					<>
						<ProfileAvatar details={details} />
						<ProfileInfoCard details={details} />
						<ProfileRelativesCard relatives={details.relatives} />
						<ProfilePaymentCard />
					</>
				)}
			</div>
			{showSwitcher && (
				<AccountSwitcher
					onClose={() => setShowSwitcher(false)}
					onAddAccount={handleAddAccount}
					onReset={() =>
						resetAllAppState({
							resetAuth: false,
							resetTheme: false,
							resetOnboarding: false,
						})
					}
				/>
			)}

			{showClearCache && (
				<ClearCacheSheet onClose={() => setShowClearCache(false)} />
			)}
		</div>
	)
}
