import { Coins, Gem } from "lucide-react";
import { type RefObject, useMemo } from "react";
import type { ActivityFilter, ActivityViewItem } from "@/entities/dashboard";
import { ErrorView, SkeletonList } from "@/shared/ui";
import { ActivityCard } from "./ActivityCard";

interface ActivityDayGroup {
	key: string;
	label: string;
	coinEarned: number;
	diamondEarned: number;
	items: ActivityViewItem[];
}

function buildDayGroups(items: ActivityViewItem[]): ActivityDayGroup[] {
	const groups = new Map<string, ActivityDayGroup>();

	for (const item of items) {
		const group = groups.get(item.dateGroupKey) ?? {
			key: item.dateGroupKey,
			label: item.dateGroupLabel,
			coinEarned: 0,
			diamondEarned: 0,
			items: [],
		};

		if (!item.isSpend && item.pointType === "COIN") {
			group.coinEarned += item.points;
		}
		if (!item.isSpend && item.pointType === "DIAMOND") {
			group.diamondEarned += item.points;
		}

		group.items.push(item);
		groups.set(item.dateGroupKey, group);
	}

	return Array.from(groups.values());
}

interface Props {
	status: string;
	activityCount: number;
	viewItems: ActivityViewItem[];
	visibleItems: ActivityViewItem[];
	visibleCount: number;
	isRefreshing: boolean;
	isFilterPending: boolean;
	sentinelRef: RefObject<HTMLDivElement | null>;
	activeFilter?: ActivityFilter;
	desktop?: boolean;
}

export function ActivityList({
	status,
	activityCount,
	viewItems,
	visibleItems,
	visibleCount,
	isRefreshing,
	isFilterPending,
	sentinelRef,
	activeFilter = "ALL",
	desktop = false,
}: Props) {
	const dayGroups = useMemo(() => buildDayGroups(visibleItems), [visibleItems]);

	return (
		<>
			{(isRefreshing || isFilterPending) && viewItems.length > 0 && (
				<div className="rounded-[20px] px-4 py-3 border border-app-border bg-app-surface/80 backdrop-blur-sm text-xs text-app-muted">
					{isFilterPending
						? "Переключаем список и подгружаем нужные записи."
						: "Обновляем историю в фоне. Пока показываем последнюю сохранённую версию."}
				</div>
			)}

			{status === "loading" && activityCount === 0 && (
				<SkeletonList count={6} height={88} />
			)}

			{status === "error" && activityCount === 0 && (
				<ErrorView message="Не удалось загрузить историю изменений" />
			)}

			{viewItems.length === 0 && status !== "loading" && (
				<div
					className="rounded-[24px] p-5 border border-app-border bg-app-surface"
					style={{ boxShadow: "var(--shadow-card)" }}
				>
					<p className="text-sm font-semibold text-app-text">
						Записей пока нет
					</p>
					<p className="text-xs text-app-muted mt-1">
						Для выбранного типа начислений история пока пустая.
					</p>
				</div>
			)}

			{visibleItems.length > 0 && desktop && (
				<div className="space-y-4">
					{dayGroups.map((group) => (
						<section
							key={group.key}
							className="rounded-[26px] border border-app-border bg-app-surface/55 p-4"
							style={{ boxShadow: "var(--shadow-card)" }}
						>
							<div className="mb-4 flex items-center justify-between gap-4">
								<div>
									<p className="text-base font-bold text-app-text">
										{group.label}
									</p>
									<p className="mt-1 text-xs text-app-muted">
										{group.items.length}{" "}
										{group.items.length === 1 ? "операция" : "операций"} за день
									</p>
								</div>

								<div className="flex items-center gap-2 shrink-0">
									{activeFilter !== "DIAMOND" && (
										<div className="inline-flex items-center gap-2 rounded-2xl border border-[#00D9FF]/20 bg-[#00D9FF]/10 px-3 py-2">
											<Gem size={16} className="text-[#00D9FF]" />
											<span className="text-sm font-bold text-app-text">
												+{group.coinEarned.toLocaleString("ru-RU")}
											</span>
										</div>
									)}
									{activeFilter !== "COIN" && (
										<div className="inline-flex items-center gap-2 rounded-2xl border border-[#FFD700]/20 bg-[#FFD700]/10 px-3 py-2">
											<Coins size={16} className="text-[#FFD700]" />
											<span className="text-sm font-bold text-app-text">
												+{group.diamondEarned.toLocaleString("ru-RU")}
											</span>
										</div>
									)}
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3">
								{group.items.map((item, index) => (
									<ActivityCard
										key={item.key}
										item={item}
										index={index}
										desktop={desktop}
									/>
								))}
							</div>
						</section>
					))}
				</div>
			)}

			{visibleItems.length > 0 && !desktop && (
				<div className="space-y-3">
					{visibleItems.map((item, index) => (
						<ActivityCard
							key={item.key}
							item={item}
							index={index}
							desktop={desktop}
						/>
					))}
				</div>
			)}

			{visibleCount < viewItems.length && (
				<div
					ref={sentinelRef}
					className={desktop ? "grid grid-cols-2 gap-3 pt-1" : "space-y-3 pt-1"}
				>
					{[0, 1, 2].map((i) => (
						<div
							key={i}
							className="rounded-[24px] border border-app-border bg-app-surface animate-pulse h-24"
							style={{ boxShadow: "var(--shadow-card)" }}
						/>
					))}
				</div>
			)}
		</>
	);
}
