import { STATUS_CONFIG, STATUS_KEY_MAP } from "@/entities/homework";
import type { HomeworkStatus } from "@/entities/homework";
import { illustrations } from "@/shared/config/illustrationsConfig";
import { EmptyState, InlineImage, ShowMoreBtn } from "@/shared/ui";
import { HomeworkCard } from "../card/HomeworkCard";

interface Props {
	visibleGroups: any[];
	hasAnyItems: boolean;
	searchQuery: string;
	onLoadMore: (statusKey: number) => void;
}

export function GlobalHomeworkStatusView({
	visibleGroups,
	hasAnyItems,
	searchQuery,
	onLoadMore,
}: Props) {
	const isSearching = searchQuery.trim().length > 0;
	const hasVisibleItems = isSearching ? visibleGroups.length > 0 : hasAnyItems;

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
				const { label, icon: Icon, textColor } = STATUS_CONFIG[s as HomeworkStatus];
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
						<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-3">
							{group.items.map((hw: any) => (
								<HomeworkCard key={hw.id} hw={hw} />
							))}
						</div>
						{group.hasMore && !isSearching && (
							<ShowMoreBtn
								onClick={() => onLoadMore(STATUS_KEY_MAP[s as HomeworkStatus])}
								remaining={group.total - group.items.length}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
