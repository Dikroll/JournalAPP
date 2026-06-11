import type {
	GroupData,
	HomeworkStatus,
	HomeworkItemWithStatus as HW,
	SubjectData,
} from "@/entities/homework";
import {
	STATUS_CONFIG,
	STATUS_KEY_MAP,
	useHomeworkStatusFiltering,
} from "@/entities/homework";
import type { Subject } from "@/entities/subject";
import { illustrations } from "@/shared/config/illustrationsConfig";
import { EmptyState, InlineImage, ShowMoreBtn } from "@/shared/ui";
import { matchesHomeworkSearch } from "../../lib/homeworkSearch";
import { HomeworkCard } from "../card/HomeworkCard";

interface Props {
	byStatus: Record<HomeworkStatus, GroupData>;
	filterStatus: HomeworkStatus | null;
	selectedSpec: Subject | null;
	subjectData: SubjectData | undefined;
	searchQuery?: string;
	onLoadMore: (statusKey: number) => void;
	onLoadMoreForSubject: (specId: number, statusKey: number) => void;
}

export function HomeworkStatusView({
	byStatus,
	filterStatus,
	selectedSpec,
	subjectData,
	searchQuery = "",
	onLoadMore,
	onLoadMoreForSubject,
}: Props) {
	const { statusesToShow, hasAnyItems, filteredGroups } =
		useHomeworkStatusFiltering(byStatus, filterStatus);
	const isSearching = searchQuery.trim().length > 0;

	const visibleGroups = filteredGroups
		.map(({ status, group }) => {
			const subjectItems = selectedSpec
				? group.items.filter(
						(hw) =>
							hw.spec_id === selectedSpec.id ||
							hw.spec_name === selectedSpec.name,
					)
				: group.items;

			return {
				status,
				group: {
					...group,
					items: subjectItems.filter((hw) =>
						matchesHomeworkSearch(hw, searchQuery),
					),
					total: selectedSpec ? subjectItems.length : group.total,
					hasMore: selectedSpec ? false : group.hasMore,
				},
			};
		})
		.filter(({ group }) => group.items.length > 0);

	if (!selectedSpec) {
		const hasVisibleItems = isSearching
			? visibleGroups.length > 0
			: hasAnyItems;

		if (!hasVisibleItems) {
			return (
				<EmptyState
					message={isSearching ? "Ничего не найдено" : "Нет домашних заданий"}
					illustration={
						<InlineImage
							src={illustrations.noHomework}
							alt={isSearching ? "Ничего не найдено" : "Нет домашних заданий"}
							width={300}
							height={300}
						/>
					}
				/>
			);
		}

		return (
			<div className="space-y-6">
				{visibleGroups.map(({ status: s, group }) => {
					const { label, icon: Icon, textColor } = STATUS_CONFIG[s];
					return (
						<div key={s}>
							<h2 className="text-base font-semibold text-app-text mb-3 flex items-center gap-2">
								<Icon size={18} className={textColor} />
								{label}
								<span className="text-sm text-app-muted font-normal">
									({isSearching ? group.items.length : group.total}
									{!isSearching && group.hasMore ? "+" : ""})
								</span>
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								{group.items.map((hw) => (
									<HomeworkCard key={hw.id} hw={hw} />
								))}
							</div>
							{group.hasMore && !isSearching && (
								<ShowMoreBtn
									onClick={() => onLoadMore(STATUS_KEY_MAP[s])}
									remaining={group.total - group.items.length}
								/>
							)}
						</div>
					);
				})}
			</div>
		);
	}

	const canUseSubjectData =
		subjectData?.status === "success" && subjectData.loadedAt !== null;
	const loadedSubjectData = canUseSubjectData ? subjectData : null;

	if (selectedSpec && !canUseSubjectData && visibleGroups.length > 0) {
		return (
			<div className="space-y-6">
				{visibleGroups.map(({ status: s, group }) => {
					const { label, icon: Icon, textColor } = STATUS_CONFIG[s];
					return (
						<div key={s}>
							<h2 className="text-base font-semibold text-app-text mb-3 flex items-center gap-2">
								<Icon size={18} className={textColor} />
								{label}
								<span className="text-sm text-app-muted font-normal">
									({group.items.length})
								</span>
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								{group.items.map((hw) => (
									<HomeworkCard key={hw.id} hw={hw} />
								))}
							</div>
						</div>
					);
				})}
			</div>
		);
	}

	const isLoading = !canUseSubjectData && visibleGroups.length === 0;

	if (isLoading) {
		return (
			<div className="space-y-3">
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className="bg-app-surface rounded-[20px] h-24 animate-pulse"
					/>
				))}
			</div>
		);
	}

	if (!loadedSubjectData) {
		return (
			<EmptyState
				message={isSearching ? "Ничего не найдено" : "Нет домашних заданий"}
				illustration={
					<InlineImage
						src={illustrations.noHomework}
						alt={isSearching ? "Ничего не найдено" : "Нет домашних заданий"}
						width={300}
						height={300}
					/>
				}
			/>
		);
	}

	const visibleSubjectGroups = statusesToShow
		.map((s) => {
			const numKey = STATUS_KEY_MAP[s];
			const storeItems = loadedSubjectData.items[numKey] ?? [];
			const displayItems: HW[] = storeItems
				.map((hw) => ({
					...hw,
					statusKey: s,
				}))
				.filter((hw) => matchesHomeworkSearch(hw, searchQuery));

			if (!displayItems.length) return null;

			const total = isSearching
				? displayItems.length
				: (loadedSubjectData.counters?.[s] ?? displayItems.length);
			const hasMore =
				!isSearching &&
				!loadedSubjectData.expandedStatuses.has(numKey) &&
				displayItems.length < total;

			return {
				status: s,
				numKey,
				displayItems,
				total,
				hasMore,
			};
		})
		.filter((group): group is NonNullable<typeof group> => group !== null);

	if (!visibleSubjectGroups.length) {
		return (
			<EmptyState
				message={isSearching ? "Ничего не найдено" : "Нет домашних заданий"}
				illustration={
					<InlineImage
						src={illustrations.noHomework}
						alt={isSearching ? "Ничего не найдено" : "Нет домашних заданий"}
						width={300}
						height={300}
					/>
				}
			/>
		);
	}

	return (
		<div className="space-y-6">
			{visibleSubjectGroups.map(
				({ status: s, numKey, displayItems, total, hasMore }) => {
					const { label, icon: Icon, textColor } = STATUS_CONFIG[s];

					return (
						<div key={s}>
							<h2 className="text-base font-semibold text-app-text mb-3 flex items-center gap-2">
								<Icon size={18} className={textColor} />
								{label}
								<span className="text-sm text-app-muted font-normal">
									({total}
									{hasMore ? "+" : ""})
								</span>
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								{displayItems.map((hw) => (
									<HomeworkCard key={hw.id} hw={hw} />
								))}
							</div>
							{hasMore && (
								<ShowMoreBtn
									onClick={() => onLoadMoreForSubject(selectedSpec.id, numKey)}
									remaining={total - displayItems.length}
								/>
							)}
						</div>
					);
				},
			)}
		</div>
	);
}
