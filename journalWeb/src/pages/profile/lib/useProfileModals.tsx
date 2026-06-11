import { useLeaderboard } from "@/entities/leaderboard";
import { useUser, useUserStore } from "@/entities/user";
import { LogoutConfirm } from "@/features/changeUser/ui/LogoutConfirm";
import { pageConfig } from "@/shared/config";
import { resetAllAppState } from "@/shared/lib/resetAllAppState";
import { useAuthStore } from "@/shared/model/authStore";
import { AccountSwitcher, ClearCacheSheet } from "@/widgets";
import { LeaderboardModal } from "@/widgets/Leaderboard/ui/LeaderboardModal";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export function useProfileModals() {
	const user = useUser();
	const { groupStudents, streamStudents, myRankGroup, myRankStream } =
		useLeaderboard();

	const [showSwitcher, setShowSwitcher] = useState(false);
	const [showClearCache, setShowClearCache] = useState(false);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [showLeaderboard, setShowLeaderboard] = useState(false);
	const navigate = useNavigate();

	const logout = useAuthStore((s) => s.logout);
	const clearUser = useUserStore((s) => s.clearUser);
	const activeUsername = useAuthStore((s) => s.activeUsername);

	const handleAddAccount = useCallback(() => {
		navigate(`${pageConfig.login}?addAccount=true`);
	}, [navigate]);

	const handleLeaderboardOpen = useCallback(() => {
		setShowLeaderboard(true);
	}, []);

	const handleLogout = useCallback(() => {
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
	}, [activeUsername, clearUser, logout, navigate]);

	const modals = (
		<>
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

			{user && (
				<LeaderboardModal
					isOpen={showLeaderboard}
					onClose={() => setShowLeaderboard(false)}
					groupStudents={groupStudents}
					streamStudents={streamStudents}
					myStudentId={user.student_id}
					myRankGroup={myRankGroup}
					myRankStream={myRankStream}
				/>
			)}
		</>
	);

	return {
		modals,
		handlers: {
			openSwitcher: () => setShowSwitcher(true),
			openClearCache: () => setShowClearCache(true),
			openLogoutConfirm: () => setShowLogoutConfirm(true),
			openLeaderboard: handleLeaderboardOpen,
		},
	};
}
