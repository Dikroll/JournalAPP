import { BookOpen, LayoutList } from "lucide-react";
import { useEffect, useState } from "react";
import {
	useHomework,
	useHomeworkBySubject,
	useHomeworkGroups,
} from "@/entities/homework";
import type { Subject } from "@/entities/subject";
import { useSubjects } from "@/entities/subject";
import { RefreshHomeworkButton } from "@/features/refreshHomework";
import { SpecSelector } from "@/features/selectSpec";
import { PAGE_TITLES, pageConfig } from "@/shared/config";
import type { Segment } from "@/shared/ui";
import {
	ErrorView,
	PageHeader,
	SegmentedControl,
	SkeletonList,
} from "@/shared/ui";
import {
	HomeworkCountersBar,
	HomeworkStatusView,
	HomeworkSubjectView,
} from "@/widgets";
import { HomeworkWebFilters } from "@/widgets/HomeworkList/ui/shared/HomeworkWebFilters";
import { HomeworkWebOverview } from "@/widgets/HomeworkList/ui/shared/HomeworkWebOverview";

type GroupBy = "status" | "subject";

const GROUP_TABS: Segment<GroupBy>[] = [
	{ key: "status", label: "По статусу", icon: <LayoutList size={13} /> },
	{ key: "subject", label: "По предметам", icon: <BookOpen size={13} /> },
];

export function HomeworkPage() {
	const [groupBy, setGroupBy] = useState<GroupBy>("status");
	const [selectedSpec, setSelectedSpec] = useState<Subject | null>(null);
	const { subjects: specList, status: specsStatus } = useSubjects();

	const {
		items,
		expandedStatuses,
		counters,
		status,
		error,
		filterStatus,
		loadMore,
		setFilter,
	} = useHomework();

	const { byStatus, bySubject } = useHomeworkGroups(
		items,
		expandedStatuses,
		counters,
	);
	const { subjects, loadSubject, loadMoreForSubject } = useHomeworkBySubject();

	useEffect(() => {
		if (!selectedSpec) return;
		loadSubject(selectedSpec.id, selectedSpec.name);
	}, [selectedSpec?.id, selectedSpec, loadSubject]);

	const hasData = counters !== null || Object.keys(items).length > 0;

	if (status === "error" && !hasData) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<ErrorView message={error ?? undefined} />
			</div>
		);
	}

	return (
		<div className="min-h-screen text-app-text pb-28">
			<div className="p-4 space-y-4">
				<PageHeader
					title={PAGE_TITLES[pageConfig.homework]}
					actions={<RefreshHomeworkButton />}
				/>

				{counters && (
					<>
						<div className="hidden md:block">
							<HomeworkWebOverview
								counters={counters}
								items={items}
								onFilter={setFilter}
							/>
						</div>
						<div className="hidden md:block">
							<HomeworkWebFilters
								counters={counters}
								activeFilter={filterStatus}
								onFilter={setFilter}
								subjects={specList}
								selectedSpec={selectedSpec}
								onSubjectChange={setSelectedSpec}
								subjectsLoading={specsStatus === "loading"}
							/>
						</div>
						<div className="md:hidden">
							<HomeworkCountersBar
								counters={counters}
								activeFilter={filterStatus}
								onFilter={setFilter}
							/>
						</div>
					</>
				)}

				<div className="md:hidden">
					<SegmentedControl
						segments={GROUP_TABS}
						active={groupBy}
						onChange={setGroupBy}
					/>
				</div>

				<div className="md:hidden">
					<SpecSelector
						subjects={specList}
						selectedId={selectedSpec?.id ?? null}
						onChange={setSelectedSpec}
						loading={specsStatus === "loading"}
					/>
				</div>
			</div>

			<div className="px-4">
				{status === "loading" ? (
					<SkeletonList count={5} height={120} />
				) : (
					<>
						<div className="hidden md:block">
							<HomeworkStatusView
								byStatus={byStatus}
								filterStatus={filterStatus}
								selectedSpec={selectedSpec}
								subjectData={
									selectedSpec ? subjects[selectedSpec.id] : undefined
								}
								onLoadMore={loadMore}
								onLoadMoreForSubject={loadMoreForSubject}
							/>
						</div>

						<div className="md:hidden">
							{groupBy === "status" ? (
								<HomeworkStatusView
									byStatus={byStatus}
									filterStatus={filterStatus}
									selectedSpec={selectedSpec}
									subjectData={
										selectedSpec ? subjects[selectedSpec.id] : undefined
									}
									onLoadMore={loadMore}
									onLoadMoreForSubject={loadMoreForSubject}
								/>
							) : (
								<HomeworkSubjectView
									bySubject={bySubject}
									filterStatus={filterStatus}
									selectedSpec={selectedSpec}
									specList={specList}
									subjects={subjects}
									onLoadSubject={loadSubject}
									onLoadMoreForSubject={loadMoreForSubject}
								/>
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
