import type { GroupData, HomeworkStatus, SubjectData } from "@/entities/homework";
import { useHomeworkStatusFiltering } from "@/entities/homework";
import type { Subject } from "@/entities/subject";
import { matchesHomeworkSearch } from "../../lib/homeworkSearch";
import { GlobalHomeworkStatusView } from "./GlobalHomeworkStatusView";
import { SubjectHomeworkStatusView } from "./SubjectHomeworkStatusView";

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
		return (
			<GlobalHomeworkStatusView
				visibleGroups={visibleGroups}
				hasAnyItems={hasAnyItems}
				searchQuery={searchQuery}
				onLoadMore={onLoadMore}
			/>
		);
	}

	return (
		<SubjectHomeworkStatusView
			selectedSpec={selectedSpec}
			subjectData={subjectData}
			statusesToShow={statusesToShow}
			searchQuery={searchQuery}
			onLoadMoreForSubject={onLoadMoreForSubject}
			visibleGroups={visibleGroups}
		/>
	);
}
