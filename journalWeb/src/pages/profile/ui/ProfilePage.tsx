import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { resetAllAppState } from '@/shared/lib/resetAllAppState'
import { useLeaderboard } from '@/entities/leaderboard'
import { useProfileDetails } from '@/entities/profile'
import { useUser } from '@/entities/user'

import { pageConfig } from '@/shared/config'
import { SkeletonList } from '@/shared/ui'
import {
	AccountSwitcher,
	ClearCacheSheet,
	Leaderboard,
	MarketLink,
	DesktopMarketWidget,
	ProfileHeader,
	ProfileInfoCard,
	ProfileRelativesCard,
	ReviewsList,
	SettingsSection,
} from "@/widgets";

export function ProfilePage() {
	const user = useUser();
	const { myRankGroup } = useLeaderboard();
	const { details, status: detailsStatus } = useProfileDetails();

	const [showSwitcher, setShowSwitcher] = useState(false);
	const [showClearCache, setShowClearCache] = useState(false);
	const navigate = useNavigate();

	const handleAddAccount = () => {
		navigate(`${pageConfig.login}?addAccount=true`);
	};
	if (!user) {
		return (
			<div className="px-4 pt-4 space-y-3 max-w-4xl mx-auto w-full">
				<div className="bg-app-surface rounded-[28px] h-48 animate-pulse border border-app-border" />
				<div className="bg-app-surface rounded-[24px] h-24 animate-pulse border border-app-border" />
			</div>
		);
	}

	const isDesktop = useIsDesktop()

	if (!isDesktop) {
		return (
			<div className="pb-24 w-full">
				<ProfileHeader user={user} rank={myRankGroup?.position} />

				<div className="px-4 space-y-5 mt-4">
					<Leaderboard myStudentId={user.student_id} />
					<MarketLink />
					<ReviewsList />
				</div>
			</div>
		);
	}

	return (
		<div className="pb-24 w-full">
			<div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-5 items-start">
				{/* Левая колонка: Шапка, Детали */}
				<div className="space-y-4 lg:space-y-5">
					<ProfileHeader user={user} rank={myRankGroup?.position} />

					<div className="px-4 space-y-5">
						{detailsStatus === "loading" && (
							<SkeletonList count={3} height={120} />
						)}

						{details && (
							<div
								className="bg-app-surface rounded-[24px] border border-app-border p-4"
								style={{ boxShadow: "var(--shadow-card)" }}
							>
								<p className="text-lg font-bold text-app-text mb-2 px-1">
									Детали профиля
								</p>
								<ProfileInfoCard details={details} flat />

								{details.relatives.length > 0 && (
									<>
										<div className="h-px bg-app-border my-2" />
										<ProfileRelativesCard relatives={details.relatives} flat />
									</>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Правая колонка: Маркет, Настройки */}
				<div className="px-4 space-y-5 lg:pt-4 pt-5">
					<DesktopMarketWidget user={user} />

					<SettingsSection
						onAccounts={() => setShowSwitcher(true)}
						onClearCache={() => setShowClearCache(true)}
					/>
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
	);
}
