import { useLeaderboard } from "@/entities/leaderboard";
import { useProfileDetails } from "@/entities/profile";
import type { UserInfo } from "@/entities/user";
import { SkeletonList } from "@/shared/ui";
import {
	DesktopActivityPreview,
	DesktopMarketWidget,
	ProfileHeader,
	ProfileInfoCard,
	ProfileRelativesCard,
	ReviewsList,
	SettingsSection,
} from "@/widgets";
import { Users } from "lucide-react";

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

export function DesktopProfileLayout({ user, handlers, modals }: Props) {
	const { myRankGroup } = useLeaderboard();
	const { details, status: detailsStatus } = useProfileDetails();

	return (
		<div className="pb-24 w-full lg:max-w-7xl lg:mx-auto lg:px-8 lg:pt-6">
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] lg:gap-6 items-start">
				{/* Левая колонка: Шапка, Детали, Отзывы, История */}
				<div className="space-y-4 min-w-0">
					<div className="lg:-mx-4 lg:-mt-4">
						<ProfileHeader
							user={user}
							rank={myRankGroup?.position}
							onRankClick={handlers.openLeaderboard}
						/>
					</div>

					<div className="px-4 lg:px-0 space-y-4">
						{detailsStatus === "loading" && (
							<SkeletonList count={3} height={120} />
						)}

						{details && (
							<div
								className="bg-app-surface rounded-3xl border border-app-border p-5"
								style={{ boxShadow: "var(--shadow-card)" }}
							>
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-[17px] font-bold text-app-text flex items-center gap-2.5">
										<Users size={20} className="text-app-muted" />
										Личные Данные
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
				<div className="px-4 lg:px-0 space-y-4 pt-4 lg:pt-0">
					<DesktopMarketWidget user={user} />

					{details && details.relatives.length > 0 && (
						<ProfileRelativesCard relatives={details.relatives} />
					)}

					<SettingsSection
						onAccounts={handlers.openSwitcher}
						onClearCache={handlers.openClearCache}
						onLogout={handlers.openLogoutConfirm}
					/>

					<div className="text-center pt-6 pb-4 opacity-40 select-none">
						<p className="text-[10px] font-bold text-app-muted uppercase tracking-widest">
							ТопКолледж Журнал
						</p>
						<p className="text-[9px] font-medium text-app-muted mt-1">
							Не официальное приложение
						</p>
					</div>
				</div>
			</div>

			{modals}
		</div>
	);
}
