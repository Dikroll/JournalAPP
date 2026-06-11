import { ArrowLeft, Coins, Gem, RefreshCw, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import type { ActivityFilter } from "@/entities/dashboard";
import { useDashboardActivityViewModel } from "@/entities/dashboard";
import { PAGE_TITLES, pageConfig } from "@/shared/config";
import { useSwipeBack } from "@/shared/hooks";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import type { Segment } from "@/shared/ui";
import { PageHeader, SegmentedControl } from "@/shared/ui";
import { ActivityIntroCard } from "@/widgets/Profile/Activity/ui/ActivityIntroCard";
import { ActivityList } from "@/widgets/Profile/Activity/ui/ActivityList";

const FILTERS: Segment<ActivityFilter>[] = [
	{
		key: "ALL",
		label: "Все",
		icon: <TrendingUp size={14} />,
	},
	{
		key: "COIN",
		label: "Топгемы",
		icon: <Gem size={14} className="text-[#00D9FF]" />,
	},
	{
		key: "DIAMOND",
		label: "Топмани",
		icon: <Coins size={14} className="text-[#FFD700]" />,
	},
];

export function ProfileActivityPage() {
	const navigate = useNavigate();
	const model = useDashboardActivityViewModel();
	const isDesktop = useIsDesktop();
	const summary = useMemo(() => {
		return model.viewItems.reduce(
			(acc, item) => {
				const amount = Number(item.pointsLabel.replace(/[^\d]/g, "")) || 0;
				if (item.isSpend) {
					acc.spend += amount;
				} else {
					acc.earn += amount;
				}
				if (item.pointType === "COIN") acc.coins += 1;
				if (item.pointType === "DIAMOND") acc.diamonds += 1;
				return acc;
			},
			{ earn: 0, spend: 0, coins: 0, diamonds: 0 },
		);
	}, [model.viewItems]);

	useSwipeBack();

	return (
		<div
			className={
				isDesktop
					? "w-full max-w-7xl mx-auto px-6 pt-6 pb-8 text-app-text"
					: "pb-6 text-app-text"
			}
		>
			<div
				className={
					isDesktop
						? "flex items-center gap-3 pb-5"
						: "flex items-center gap-3 px-4 pt-4 pb-4"
				}
			>
				<button
					type="button"
					onClick={() => navigate(-1)}
					className={`${isDesktop ? "w-11 h-11 rounded-[16px]" : "w-9 h-9 rounded-[14px]"} bg-app-surface border border-app-border flex items-center justify-center text-app-muted hover:text-app-text hover:bg-app-surface-hover active:scale-95 transition-all`}
					aria-label="Назад"
				>
					<ArrowLeft size={isDesktop ? 20 : 18} />
				</button>
				<div className="flex-1">
					<PageHeader title={PAGE_TITLES[pageConfig.profileActivity]} />
				</div>
				<button
					type="button"
					onClick={() => void model.refreshActivity()}
					className={`${isDesktop ? "w-11 h-11 rounded-[16px]" : "w-9 h-9 rounded-[14px]"} bg-app-surface border border-app-border flex items-center justify-center text-app-muted hover:text-app-text hover:bg-app-surface-hover active:scale-95 transition-all`}
					aria-label="Обновить"
				>
					<RefreshCw
						size={isDesktop ? 20 : 18}
						className={model.isRefreshing ? "animate-spin" : undefined}
					/>
				</button>
			</div>

			<div className={isDesktop ? "space-y-4" : "px-4 space-y-3"}>
				{isDesktop ? (
					<div className="grid grid-cols-[minmax(0,1fr)_360px] gap-4">
						<ActivityIntroCard desktop />
						<div
							className="rounded-3xl border border-app-border bg-app-surface p-5"
							style={{ boxShadow: "var(--shadow-card)" }}
						>
							<p className="text-sm font-semibold text-app-text">
								Сводка по фильтру
							</p>
							<div className="mt-4 grid grid-cols-2 gap-3">
								<div className="rounded-3xl border border-app-border bg-app-surface-hover p-3">
									<p className="text-[11px] uppercase tracking-[0.12em] text-app-muted">
										Начислено
									</p>
									<p className="mt-1 text-xl font-bold text-status-checked">
										+{summary.earn.toLocaleString("ru-RU")}
									</p>
								</div>
								<div className="rounded-3xl border border-app-border bg-app-surface-hover p-3">
									<p className="text-[11px] uppercase tracking-[0.12em] text-app-muted">
										Списано
									</p>
									<p className="mt-1 text-xl font-bold text-status-overdue">
										−{summary.spend.toLocaleString("ru-RU")}
									</p>
								</div>
								<div className="rounded-3xl border border-[#00D9FF]/20 bg-[#00D9FF]/10 p-3">
									<p className="text-[11px] uppercase tracking-[0.12em] text-app-muted">
										Топгемы
									</p>
									<p className="mt-1 text-xl font-bold text-app-text">
										{summary.coins}
									</p>
								</div>
								<div className="rounded-3xl border border-[#FFD700]/20 bg-[#FFD700]/10 p-3">
									<p className="text-[11px] uppercase tracking-[0.12em] text-app-muted">
										Топмани
									</p>
									<p className="mt-1 text-xl font-bold text-app-text">
										{summary.diamonds}
									</p>
								</div>
							</div>
						</div>
					</div>
				) : (
					<ActivityIntroCard />
				)}

				<div
					className={
						isDesktop
							? "rounded-3xl border border-app-border bg-app-surface/70 p-2"
							: undefined
					}
					style={isDesktop ? { boxShadow: "var(--shadow-card)" } : undefined}
				>
					<SegmentedControl
						segments={FILTERS}
						active={model.activeFilter}
						onChange={model.setActiveFilter}
					/>
				</div>

				<ActivityList
					status={model.status}
					activityCount={model.activityCount}
					viewItems={model.viewItems}
					visibleItems={model.visibleItems}
					visibleCount={model.visibleCount}
					isRefreshing={model.isRefreshing}
					isFilterPending={model.isFilterPending}
					sentinelRef={model.sentinelRef}
					activeFilter={model.activeFilter}
					desktop={isDesktop}
				/>
			</div>
		</div>
	);
}
