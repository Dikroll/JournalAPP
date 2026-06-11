import { useLeaderboard } from "@/entities/leaderboard";
import type { UserInfo } from "@/entities/user";
import {
	Leaderboard,
	MarketLink,
	ProfileHeader,
	ReviewsList,
	SettingsSection,
} from "@/widgets";

interface Props {
	user: UserInfo;
	handlers: {
		openSwitcher: () => void;
		openClearCache: () => void;
		openLogoutConfirm: () => void;
		openLeaderboard: () => void;
	};
	modals: React.ReactNode;
}

export function MobileProfileLayout({ user, handlers, modals }: Props) {
	const { myRankGroup } = useLeaderboard();

	return (
		<div className="pb-24 w-full">
			<ProfileHeader
				user={user}
				rank={myRankGroup?.position}
				onRankClick={handlers.openLeaderboard}
			/>

			<div className="px-4 space-y-4 mt-2">
				{/* Leaderboard card */}
				<div
					className="bg-app-surface rounded-3xl border border-app-border overflow-hidden p-4"
					style={{ boxShadow: "var(--shadow-card)" }}
				>
					<Leaderboard myStudentId={user.student_id} />
				</div>

				<MarketLink />
				<ReviewsList />
				<SettingsSection
					onAccounts={handlers.openSwitcher}
					onClearCache={handlers.openClearCache}
					onLogout={handlers.openLogoutConfirm}
				/>
			</div>

			{modals}
		</div>
	);
}
