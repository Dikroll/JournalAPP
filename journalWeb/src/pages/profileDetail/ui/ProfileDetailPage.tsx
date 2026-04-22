import { resetAllAppState } from '@/app/lib'
import { useProfileDetails } from '@/entities/profile'
import { pageConfig } from '@/shared/config'
import { useSwipeBack } from '@/shared/hooks/useSwipeBack'
import { ErrorView, IconButton, PageHeader, SkeletonList } from '@/shared/ui'
import {
	AccountSwitcher,
	ClearCacheSheet,
	ProfileAvatar,
	ProfileInfoCard,
	ProfilePaymentCard,
	ProfileRelativesCard,
} from '@/widgets'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SettingsSection } from './SettingsSection'

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
					<PageHeader title='Детали профиля' />
				</div>
			</div>

			<div className='px-4 space-y-3'>
				{status === 'loading' && <SkeletonList count={3} height={120} />}
				{status === 'error' && !details && (
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

				<SettingsSection
					onAccounts={() => setShowSwitcher(true)}
					onClearCache={() => setShowClearCache(true)}
				/>
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
