import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { resetAllAppState } from '@/shared/lib/resetAllAppState'
import { useProfileDetails } from '@/entities/profile'
import { pageConfig, PAGE_TITLES } from '@/shared/config'
import { useSwipeBack } from '@/shared/hooks/useSwipeBack'
import { ErrorView, IconButton, PageHeader, SkeletonList } from '@/shared/ui'
import { useAuthStore } from '@/shared/model/authStore'
import { useUserStore } from '@/entities/user'
import { LogoutConfirm } from '@/features/changeUser/ui/LogoutConfirm'
import {
	AccountSwitcher,
	ClearCacheSheet,
	ProfileAvatar,
	ProfileInfoCard,
	ProfilePaymentCard,
	ProfileRelativesCard,
	SettingsSection,
} from "@/widgets";

export function ProfileDetailsPage() {
	const navigate = useNavigate();
	const { details, status } = useProfileDetails();
	const [showSwitcher, setShowSwitcher] = useState(false);
	const [showClearCache, setShowClearCache] = useState(false);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

	const logout = useAuthStore((s) => s.logout);
	const clearUser = useUserStore((s) => s.clearUser);
	const activeUsername = useAuthStore((s) => s.activeUsername);

	useSwipeBack();

	const handleAddAccount = () => {
		navigate(`${pageConfig.login}?addAccount=true`);
	};

	const handleLogout = () => {
		const remaining = useAuthStore
			.getState()
			.accounts.filter((a) => a.username !== activeUsername);
		resetAllAppState({
			resetAuth: false,
			resetTheme: false,
			resetOnboarding: false,
		});
		clearUser();
		logout();
		setShowLogoutConfirm(false);
		if (remaining.length === 0) {
			navigate(pageConfig.login, { replace: true });
		} else {
			navigate(pageConfig.home, { replace: true });
		}
	};

	return (
		<div className="pb-6 max-w-4xl mx-auto w-full">
			<div className="flex items-center gap-2 px-4 pt-4 pb-4">
				<IconButton
					icon={<ArrowLeft size={18} />}
					onClick={() => navigate(-1)}
					size="md"
					shape="square"
					variant="surface"
					style={{ boxShadow: "var(--shadow-card)" }}
					aria-label="Назад"
				/>

				<div className="flex-1">
					<PageHeader title={PAGE_TITLES[pageConfig.profileDetails]} />
				</div>
			</div>

			<div className="px-4 space-y-3">
				{status === "loading" && <SkeletonList count={3} height={120} />}
				{status === "error" && !details && (
					<ErrorView message="Не удалось загрузить данные" />
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
	);
}
