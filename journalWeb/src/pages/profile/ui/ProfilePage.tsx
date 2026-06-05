import { useLeaderboard } from '@/entities/leaderboard'
import { useProfileDetails } from '@/entities/profile'
import { useUser, useUserStore } from '@/entities/user'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { resetAllAppState } from '@/shared/lib/resetAllAppState'
import { Users } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { LogoutConfirm } from '@/features/changeUser/ui/LogoutConfirm'
import { useAuthStore } from '@/shared/model/authStore'

import { pageConfig } from '@/shared/config'
import { SkeletonList } from '@/shared/ui'
import {
	AccountSwitcher,
	ClearCacheSheet,
	DesktopActivityPreview,
	DesktopMarketWidget,
	Leaderboard,
	MarketLink,
	ProfileHeader,
	ProfileInfoCard,
	ProfileRelativesCard,
	ReviewsList,
	SettingsSection,
} from '@/widgets'

export function ProfilePage() {
	const user = useUser()
	const { myRankGroup } = useLeaderboard()
	const { details, status: detailsStatus } = useProfileDetails()

	const [showSwitcher, setShowSwitcher] = useState(false)
	const [showClearCache, setShowClearCache] = useState(false)
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
	const navigate = useNavigate()

	const logout = useAuthStore(s => s.logout)
	const clearUser = useUserStore(s => s.clearUser)
	const activeUsername = useAuthStore(s => s.activeUsername)

	const handleAddAccount = () => {
		navigate(`${pageConfig.login}?addAccount=true`)
	}

	const handleLogout = () => {
		const remaining = useAuthStore
			.getState()
			.accounts.filter(a => a.username !== activeUsername)
		resetAllAppState({
			resetAuth: false,
			resetTheme: false,
			resetOnboarding: false,
		})
		clearUser()
		logout()
		setShowLogoutConfirm(false)
		if (remaining.length === 0) {
			navigate(pageConfig.login, { replace: true })
		} else {
			navigate(pageConfig.home, { replace: true })
		}
	}

	if (!user) {
		return (
			<div className='px-4 pt-4 space-y-3 max-w-4xl mx-auto w-full'>
				<div className='bg-app-surface rounded-[28px] h-48 animate-pulse border border-app-border' />
				<div className='bg-app-surface rounded-[24px] h-24 animate-pulse border border-app-border' />
			</div>
		)
	}

	const isDesktop = useIsDesktop()

	if (!isDesktop) {
		return (
			<div className='pb-24 w-full'>
				<ProfileHeader user={user} rank={myRankGroup?.position} />

				<div className='px-4 space-y-4 mt-4'>
					{/* Leaderboard card */}
					<div
						className='bg-app-surface rounded-[20px] border border-app-border overflow-hidden p-4'
						style={{ boxShadow: 'var(--shadow-card)' }}
					>
						<Leaderboard myStudentId={user.student_id} />
					</div>

					<MarketLink />

					<ReviewsList />

					<SettingsSection
						onAccounts={() => setShowSwitcher(true)}
						onClearCache={() => setShowClearCache(true)}
						onLogout={() => setShowLogoutConfirm(true)}
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

				{showLogoutConfirm && (
					<LogoutConfirm
						onConfirm={handleLogout}
						onCancel={() => setShowLogoutConfirm(false)}
					/>
				)}
			</div>
		)
	}

	return (
		<div className='pb-24 w-full lg:max-w-7xl lg:mx-auto lg:px-8 lg:pt-6'>
			<div className='grid grid-cols-1 lg:grid-cols-[1fr_380px] lg:gap-6 items-start'>
				{/* Левая колонка: Шапка, Детали, Отзывы, История */}
				<div className='space-y-4'>
					<div className='lg:-mx-4 lg:-mt-4'>
						<ProfileHeader user={user} rank={myRankGroup?.position} />
					</div>

					<div className='px-4 lg:px-0 space-y-4'>
						{detailsStatus === 'loading' && (
							<SkeletonList count={3} height={120} />
						)}

						{details && (
							<div
								className='bg-app-surface rounded-[24px] border border-app-border p-5'
								style={{ boxShadow: 'var(--shadow-card)' }}
							>
								<div className='flex items-center justify-between mb-4'>
									<h2 className='text-[17px] font-bold text-app-text flex items-center gap-2.5'>
										<Users size={20} className='text-[#E0A890]' />
										Личные данные
									</h2>
								</div>
								<ProfileInfoCard details={details} flat />
							</div>
						)}

						<ReviewsList />
						<DesktopActivityPreview />
					</div>
				</div>

				{/* Правая колонка: Маркет, Родственники, Настройки */}
				<div className='px-4 lg:px-0 space-y-4 pt-4 lg:pt-0'>
					<DesktopMarketWidget user={user} />

					{details && details.relatives.length > 0 && (
						<ProfileRelativesCard relatives={details.relatives} />
					)}

					<SettingsSection
						onAccounts={() => setShowSwitcher(true)}
						onClearCache={() => setShowClearCache(true)}
						onLogout={() => setShowLogoutConfirm(true)}
					/>

					{isDesktop && (
						<div className='text-center pt-6 pb-4 opacity-40 select-none'>
							<p className='text-[10px] font-bold text-app-muted uppercase tracking-widest'>
								ТопКолледж Журнал
							</p>
							<p className='text-[9px] font-medium text-app-muted mt-1'>
								Не официальное приложение
							</p>
						</div>
					)}
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

			{showLogoutConfirm && (
				<LogoutConfirm
					onConfirm={handleLogout}
					onCancel={() => setShowLogoutConfirm(false)}
				/>
			)}
		</div>
	)
}
