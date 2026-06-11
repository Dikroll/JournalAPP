import { STATUS_CONFIG, STATUS_KEY_MAP } from "@/entities/homework";
import type { HomeworkItemWithStatus as HW } from "@/entities/homework";
import type { SubjectData } from "@/entities/homework";
import type { HomeworkStatus } from "@/entities/homework";
import type { Subject } from "@/entities/subject";
import { illustrations } from "@/shared/config/illustrationsConfig";
import { EmptyState, InlineImage, ShowMoreBtn } from "@/shared/ui";
import { matchesHomeworkSearch } from "../../lib/homeworkSearch";
import { HomeworkCard } from "../card/HomeworkCard";

interface Props {
	selectedSpec: Subject;
	subjectData: SubjectData | undefined;
	statusesToShow: HomeworkStatus[];
	searchQuery: string;
	onLoadMoreForSubject: (specId: number, statusKey: number) => void;
	visibleGroups: any[];
}

export function SubjectHomeworkStatusView({
	selectedSpec,
	subjectData,
	statusesToShow,
	searchQuery,
	onLoadMoreForSubject,
	visibleGroups,
}: Props) {
	const isSearching = searchQuery.trim().length > 0;
	const canUseSubjectData =
		subjectData?.status === "success" && subjectData.loadedAt !== null;
	const loadedSubjectData = canUseSubjectData ? subjectData : null;

	if (!canUseSubjectData && visibleGroups.length > 0) {
		return (
			<div className="space-y-6">
				{visibleGroups.map(({ status: s, group }) => {
					const { label, icon: Icon, textColor } = STATUS_CONFIG[s as HomeworkStatus];
					return (
						<div key={s}>
							<h2 className="text-base font-semibold text-app-text mb-3 flex items-center gap-2">
								<Icon size={18} className={textColor} />
								{label}
								<span className="text-sm text-app-muted font-normal">
									({group.items.length})
								</span>
							</h2>
							<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-3">
								{group.items.map((hw: HW) => (
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
						className="bg-app-surface rounded-3xl h-24 animate-pulse"
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
							<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-3">
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
