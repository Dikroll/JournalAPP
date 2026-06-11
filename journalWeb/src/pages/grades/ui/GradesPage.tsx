import { Check, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDashboardCharts } from "@/entities/dashboard";
import {
	useGrades,
	useGradesBySubject,
	useGradesGroups,
} from "@/entities/grades";
import { useScheduleWeek } from "@/entities/schedule";
import { useSubjects } from "@/entities/subject";
import {
	DesktopDateRangePicker,
	DesktopGradeFilter,
} from "@/features/gradesFilter";
import { RefreshGradesButton } from "@/features/refreshGrades";
import { SpecSelector } from "@/features/selectSpec";
import { PAGE_TITLES, pageConfig } from "@/shared/config";

import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { ErrorView, PageHeader, SkeletonList } from "@/shared/ui";
import { getTodayString } from "@/shared/utils";
import { GoalsSummaryCard } from "@/widgets/Goals/GoalsSummaryCard/ui/GoalsSummaryCard";
import { DesktopSubjectsWidget } from "@/widgets/Grades/DesktopSubjectsWidget";
import { GradesCalendar } from "@/widgets/Grades/GradesCalendar/ui/GradesCalendar";
import { GradesCharts } from "@/widgets/Grades/GradesCharts/ui/GradesCharts";
import { GradesExamList } from "@/widgets/Grades/GradesList/ui/GradesExamList";
import { GradesRecentList } from "@/widgets/Grades/GradesList/ui/GradesRecentList";
import { GradesSubjectList } from "@/widgets/Grades/GradesList/ui/GradesSubjectList";
import type { Tab } from "@/widgets/Grades/GradesTabs/ui/GradesTabs";
import { GradesTabs } from "@/widgets/Grades/GradesTabs/ui/GradesTabs";

export function GradesPage() {
	const [activeTab, setActiveTab] = useState<Tab>("recent");
	const [selectedSpecId, setSelectedSpecId] = useState<number | null>(null);
	const [selectedGrade, setSelectedGrade] = useState<string>("all");
	const [onlyWithGrades, setOnlyWithGrades] = useState(false);
	const [onlyAbsences, setOnlyAbsences] = useState(false);
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [datesInitialized, setDatesInitialized] = useState(false);

	const isDesktop = useIsDesktop();
	const today = useMemo(() => getTodayString(), []);
	const { entries, status, error, refresh } = useGrades();
	const { progress, attendance } = useDashboardCharts({});

	useEffect(() => {
		if (entries.length > 0 && !datesInitialized) {
			const earliest = entries[entries.length - 1]?.date;
			if (earliest) {
				setStartDate(earliest);
				setEndDate(today);
				setDatesInitialized(true);
			}
		}
	}, [entries, datesInitialized, today]);

	const { bySubject: subjectCache, loadSubject } = useGradesBySubject();
	const { subjects: specList, status: specsStatus } = useSubjects();
	const { lessons: weekLessons } = useScheduleWeek(today);

	const handleSpecChange = useCallback(
		(spec: { id: number } | null) => {
			const id = spec?.id ?? null;
			setSelectedSpecId(id);
			if (id != null) {
				setTimeout(() => loadSubject(id), 0);
			}
		},
		[loadSubject],
	);

	const selectedSubjectCache = useMemo(
		() => (selectedSpecId != null ? subjectCache[selectedSpecId] : null),
		[selectedSpecId, subjectCache],
	);

	const sourceEntries = useMemo(() => {
		let list =
			selectedSubjectCache?.status === "success"
				? selectedSubjectCache.entries
				: selectedSpecId != null
					? entries.filter((e) => e.spec_id === selectedSpecId)
					: entries;

		if (activeTab !== "subjects" && onlyWithGrades) {
			list = list.filter((e) => e.marks && Object.keys(e.marks).length > 0);
		}
		if (activeTab !== "subjects" && onlyAbsences) {
			list = list.filter((e) => e.attended === "absent");
		}
		if (selectedGrade !== "all") {
			list = list.filter(
				(e) =>
					e.marks &&
					Object.values(e.marks).some((m) => String(m) === selectedGrade),
			);
		}

		if (activeTab === "recent" && startDate) {
			list = list.filter((e) => e.date >= startDate);
		}
		if (activeTab === "recent" && endDate) {
			list = list.filter((e) => e.date <= endDate);
		}

		return list;
	}, [
		selectedSubjectCache,
		selectedSpecId,
		entries,
		onlyWithGrades,
		onlyAbsences,
		selectedGrade,
		startDate,
		endDate,
		activeTab,
	]);

	const hasGradeFilters =
		onlyWithGrades || onlyAbsences || selectedGrade !== "all";

	const selectedSubjectName = useMemo(
		() =>
			specList.find((subject) => subject.id === selectedSpecId)?.name ?? null,
		[specList, selectedSpecId],
	);

	const { byDate, bySubject, byMonth } = useGradesGroups(
		sourceEntries,
		activeTab,
	);

	const isLoading = status === "loading" || status === "idle";

	if (status === "error" && entries.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<ErrorView message={error ?? undefined} onRetry={refresh} />
			</div>
		);
	}

	return (
		<div className="min-h-screen text-app-text pb-28">
			{/* Mobile-only header block */}
			<div className="p-4 space-y-4 xl:hidden">
				<PageHeader
					title={PAGE_TITLES[pageConfig.grades]}
					actions={<RefreshGradesButton />}
				/>
				<GoalsSummaryCard className="h-full" />
				<SpecSelector
					subjects={specList}
					selectedId={selectedSpecId}
					onChange={handleSpecChange}
					loading={specsStatus === "loading"}
				/>
				<GradesTabs active={activeTab} onChange={setActiveTab} />
			</div>

			<div className="xl:flex xl:gap-6 xl:px-6 xl:pt-5">
				{/* Main Content (Left Column) */}
				<div className="flex-1 min-w-0">
					{/* Desktop-only header block */}
					<div className="hidden xl:block mb-6">
						<div className="mb-5 flex items-center justify-between">
							<h1 className="text-[26px] font-bold text-app-text">Оценки</h1>
							<RefreshGradesButton />
						</div>

						{/* Desktop Tabs */}
						<div className="mb-5 flex gap-8 border-b border-app-border">
							{[
								{ key: "recent", label: "По ленте" },
								{ key: "calendar", label: "Календарь" },
								{ key: "subjects", label: "По предметам" },
								{ key: "exams", label: "Экзамены" },
							].map((tab) => (
								<button
									type="button"
									key={tab.key}
									onClick={() => setActiveTab(tab.key as Tab)}
									className={`pb-3 text-[15px] font-medium border-b-2 transition-colors ${
										activeTab === tab.key
											? "border-status-overdue text-app-text"
											: "border-transparent text-app-muted hover:text-app-text"
									}`}
								>
									{tab.label}
								</button>
							))}
						</div>

						{/* Desktop Filters Row */}
						{activeTab !== "exams" ? (
							<div className="mb-6 rounded-3xl border border-app-border bg-app-surface/40 p-3">
								<div className="flex flex-wrap items-center gap-3">
									{activeTab === "recent" && (
										<DesktopDateRangePicker
											startDate={startDate}
											endDate={endDate}
											onStartDateChange={setStartDate}
											onEndDateChange={setEndDate}
										/>
									)}

									<div className="min-w-[260px] flex-1">
										<SpecSelector
											subjects={specList}
											selectedId={selectedSpecId}
											onChange={handleSpecChange}
											loading={specsStatus === "loading"}
										/>
									</div>

									<DesktopGradeFilter
										value={selectedGrade}
										onChange={setSelectedGrade}
									/>

									{((activeTab === "recent" && (startDate || endDate)) ||
										selectedSpecId ||
										selectedGrade !== "all") && (
										<button
											type="button"
											onClick={() => {
												setStartDate("");
												setEndDate("");
												handleSpecChange(null);
												setSelectedGrade("all");
											}}
											className="flex h-12 w-12 items-center justify-center rounded-3xl border border-app-border bg-app-surface text-app-muted transition-colors hover:bg-app-surface-hover hover:text-app-text"
											title="Сбросить фильтры"
										>
											<X size={17} />
										</button>
									)}
								</div>

								{activeTab !== "subjects" && (
									<div className="mt-3 flex items-center gap-6 px-1">
										<label className="group flex cursor-pointer items-center gap-2.5 text-[14px] text-app-text">
											<input
												type="checkbox"
												checked={onlyWithGrades}
												onChange={(e) => setOnlyWithGrades(e.target.checked)}
												className="hidden"
											/>
											<div
												className={`flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors ${
													onlyWithGrades
														? "border-brand bg-brand"
														: "border-app-border bg-app-surface group-hover:border-app-muted"
												}`}
											>
												{onlyWithGrades && (
													<Check
														size={12}
														className="text-white"
														strokeWidth={3}
													/>
												)}
											</div>
											<span className="text-app-muted transition-colors group-hover:text-app-text">
												Только с оценками
											</span>
										</label>

										<label className="group flex cursor-pointer items-center gap-2.5 text-[14px] text-app-text">
											<input
												type="checkbox"
												checked={onlyAbsences}
												onChange={(e) => setOnlyAbsences(e.target.checked)}
												className="hidden"
											/>
											<div
												className={`flex h-4 w-4 items-center justify-center rounded-[4px] border transition-colors ${
													onlyAbsences
														? "border-brand bg-brand"
														: "border-app-border bg-app-surface group-hover:border-app-muted"
												}`}
											>
												{onlyAbsences && (
													<Check
														size={12}
														className="text-white"
														strokeWidth={3}
													/>
												)}
											</div>
											<span className="text-app-muted transition-colors group-hover:text-app-text">
												Только пропуски
											</span>
										</label>
									</div>
								)}
							</div>
						) : null}
					</div>

					<div className="px-4 xl:px-0">
						{activeTab === "exams" ? (
							<GradesExamList
								selectedGrade={selectedGrade}
								gradeFilter={
									<DesktopGradeFilter
										value={selectedGrade}
										onChange={setSelectedGrade}
									/>
								}
							/>
						) : isLoading ? (
							<SkeletonList count={3} height={80} />
						) : (
							<>
								{activeTab === "recent" && (
									<>
										{isDesktop && (
											<GradesCharts
												progress={progress}
												attendance={attendance}
												className="mb-6"
											/>
										)}
										<GradesRecentList
											byDate={byDate}
											scheduledLessons={hasGradeFilters ? [] : weekLessons}
											selectedSubjectName={selectedSubjectName}
										/>
									</>
								)}
								{activeTab === "calendar" && (
									<GradesCalendar byMonth={byMonth} />
								)}
								{activeTab === "subjects" && (
									<GradesSubjectList bySubject={bySubject} />
								)}
							</>
						)}
					</div>
				</div>

				{/* Right Sidebar Desktop */}
				{isDesktop && activeTab !== "calendar" && activeTab !== "exams" && (
					<div className="hidden xl:flex w-[320px] shrink-0 flex-col gap-4">
						<GoalsSummaryCard />
						<DesktopSubjectsWidget
							onViewAll={() => setActiveTab("subjects")}
							onSubjectClick={(id) => handleSpecChange({ id })}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
