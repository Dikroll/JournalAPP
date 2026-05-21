import { resetAllAppState } from '@/app/lib'
import { useLeaderboard } from '@/entities/leaderboard'
import { useProfileDetails } from '@/entities/profile'
import { useUser } from '@/entities/user'
import { pageConfig } from '@/shared/config'
import { SkeletonList } from '@/shared/ui'
import {
	AccountSwitcher,
	ClearCacheSheet,
	Leaderboard,
	ProfileHeader,
	ProfileInfoCard,
	ProfilePaymentCard,
	ProfileRelativesCard,
	ReviewsList,
	SettingsSection,
} from '@/widgets'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function ProfilePage() {
	const user = useUser()
	const { myRankGroup } = useLeaderboard()
	const { details, status } = useProfileDetails()

	const [showSwitcher, setShowSwitcher] = useState(false)
	const [showClearCache, setShowClearCache] = useState(false)
	const navigate = useNavigate()

	const handleAddAccount = () => {
		navigate(`${pageConfig.login}?addAccount=true`)
	}

	if (!user) {
		return (
			<div className='px-4 pt-4 space-y-3 max-w-4xl mx-auto w-full'>
				<div className='bg-app-surface rounded-[28px] h-48 animate-pulse border border-app-border' />
				<div className='bg-app-surface rounded-[24px] h-24 animate-pulse border border-app-border' />
			</div>
		)
	}

	return (
		<div className='pb-24 w-full'>
			<div className='grid grid-cols-1 lg:grid-cols-3 lg:gap-2 items-start'>
				
				{/* 1 Колонка: Шапка и детали профиля */}
				<div className='space-y-2 lg:space-y-4'>
					<ProfileHeader user={user} rank={myRankGroup?.position} />

					<div className='px-4 space-y-5'>
						{status === 'loading' && <SkeletonList count={3} height={120} />}
						{details && (
							<>
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
				</div>

				{/* 2 Колонка: Лидеры */}
				<div className='px-4 space-y-5 lg:pt-4 pt-5'>
					{user.is_debtor && (
						<div
							className='bg-[#EF4444]/10 rounded-[20px] p-4 border border-[#EF4444]/20 flex items-center justify-between'
							style={{ boxShadow: '0 4px 16px 0 rgba(239,68,68,0.1)' }}
						>
							<div>
								<p className='text-xs text-[#9CA3AF] mb-0.5'>Статус оплаты</p>
								<p className='text-sm font-semibold text-[#EF4444]'>
									Есть задолженность
								</p>
							</div>
							<Link
								to={pageConfig.payment}
								className='px-4 py-2 rounded-[14px] bg-app-surface border border-app-border text-sm text-app-text font-medium'
							>
								История
							</Link>
						</div>
					)}

					<Leaderboard myStudentId={user.student_id} />
				</div>

				{/* 3 Колонка: Отзывы */}
				<div className='px-4 lg:pt-4 pt-5'>
					<ReviewsList />
				</div>

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
