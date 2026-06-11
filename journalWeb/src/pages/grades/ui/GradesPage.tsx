import { useState, useMemo, useEffect, useCallback } from "react";
import {
	useGrades,
	useGradesBySubject,
	useGradesGroups,
} from "@/entities/grades";
import { useScheduleWeek } from "@/entities/schedule";

import { useSubjects } from "@/entities/subject";
import { RefreshGradesButton } from "@/features/refreshGrades";
import { SpecSelector } from "@/features/selectSpec";
import { GradesCharts } from "@/widgets/Grades/GradesCharts/ui/GradesCharts";
import { useDashboardCharts } from "@/entities/dashboard";

import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { pageConfig, PAGE_TITLES } from "@/shared/config";
import { ErrorView, PageHeader, SkeletonList } from "@/shared/ui";
import { getTodayString } from "@/shared/utils";
import { GoalsSummaryCard } from "@/widgets/Goals/GoalsSummaryCard/ui/GoalsSummaryCard";
import { GradesCalendar } from "@/widgets/Grades/GradesCalendar/ui/GradesCalendar";
import { GradesExamList } from "@/widgets/Grades/GradesList/ui/GradesExamList";
import { GradesRecentList } from "@/widgets/Grades/GradesList/ui/GradesRecentList";
import { GradesSubjectList } from "@/widgets/Grades/GradesList/ui/GradesSubjectList";
import type { Tab } from "@/widgets/Grades/GradesTabs/ui/GradesTabs";
import { GradesTabs } from "@/widgets/Grades/GradesTabs/ui/GradesTabs";
import { DesktopSubjectsWidget } from "@/widgets/Grades/DesktopSubjectsWidget";

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

		if (onlyWithGrades) {
			list = list.filter((e) => e.marks && Object.keys(e.marks).length > 0);
		}
		if (onlyAbsences) {
			list = list.filter((e) => e.attended === "absent");
		}
		if (selectedGrade !== "all") {
			list = list.filter(
				(e) =>
					e.marks &&
					Object.values(e.marks).some((m) => String(m) === selectedGrade),
			);
		}
		if (startDate) {
			list = list.filter((e) => e.date >= startDate);
		}
		if (endDate) {
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
	]);

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
				<PageHeader title={PAGE_TITLES[pageConfig.grades]} actions={<RefreshGradesButton />} />
				<GoalsSummaryCard className="h-full" />
				<SpecSelector
					subjects={specList}
					selectedId={selectedSpecId}
					onChange={handleSpecChange}
					loading={specsStatus === "loading"}
				/>
				<GradesTabs active={activeTab} onChange={setActiveTab} />
			</div>

			<div className="xl:flex xl:gap-6 xl:px-4 xl:pt-4">
				{/* Main Content (Left Column) */}
				<div className="flex-1 min-w-0">
					{/* Desktop-only header block */}
					<div className="hidden xl:block mb-8 mt-2">
						<div className="flex items-center justify-between mb-8">
							<h1 className="text-[28px] font-bold text-app-text">Оценки</h1>
							<RefreshGradesButton />
						</div>

						{/* Desktop Tabs */}
						<div className="flex gap-8 border-b border-app-border mb-6">
							{[
								{ key: "recent", label: "По ленте" },
								{ key: "calendar", label: "Календарь" },
								{ key: "subjects", label: "По предметам" },
								{ key: "exams", label: "Экзамены" }
							].map(tab => (
								<button
									key={tab.key}
									onClick={() => setActiveTab(tab.key as Tab)}
									className={`pb-3 text-[15px] font-medium border-b-2 transition-colors ${
										activeTab === tab.key 
											? 'border-status-overdue text-app-text' 
											: 'border-transparent text-app-muted hover:text-app-text'
									}`}
								>
									{tab.label}
								</button>
							))}
						</div>

						{/* Desktop Filters Row */}
						<div className="flex flex-col gap-4 mb-6">
							<div className="flex flex-wrap items-center gap-4">
								<div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-app-surface text-[14px] text-app-muted border border-app-border shrink-0">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
									<div className="flex items-center gap-1.5 relative">
										<input 
											type="date" 
											value={startDate}
											onChange={(e) => setStartDate(e.target.value)}
											className="bg-transparent border-none outline-none text-app-text w-[110px] cursor-pointer [color-scheme:dark]"
										/>
										<span className="text-app-muted">-</span>
										<input 
											type="date" 
											value={endDate}
											onChange={(e) => setEndDate(e.target.value)}
											className="bg-transparent border-none outline-none text-app-text w-[110px] cursor-pointer [color-scheme:dark]"
										/>
									</div>
									{(startDate || endDate) && (
										<button 
											onClick={() => { setStartDate(""); setEndDate(""); }}
											className="ml-2 hover:bg-app-surface-strong p-1 rounded-full text-app-muted hover:text-app-text transition-colors"
											title="Сбросить даты"
										>
											<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
										</button>
									)}
								</div>

								<div className="flex-1 min-w-[240px]">
									<SpecSelector
										subjects={specList}
										selectedId={selectedSpecId}
										onChange={handleSpecChange}
										loading={specsStatus === "loading"}
									/>
								</div>
								
								<div className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-app-surface text-[14px] text-app-text border border-app-border shrink-0 min-w-[140px] justify-between">
									<select 
										value={selectedGrade} 
										onChange={(e) => setSelectedGrade(e.target.value)}
										className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
									>
										<option value="all">Все оценки</option>
										<option value="5">Только 5</option>
										<option value="4">Только 4</option>
										<option value="3">Только 3</option>
										<option value="2">Только 2</option>
									</select>
									<span>{selectedGrade === "all" ? "Все оценки" : `Оценки: ${selectedGrade}`}</span>
									<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-app-muted"><polyline points="6 9 12 15 18 9"></polyline></svg>
								</div>
							</div>

							<div className="flex items-center gap-6 px-1">
								<label className="flex items-center gap-2.5 text-[14px] text-app-text cursor-pointer group">
									<input 
										type="checkbox" 
										checked={onlyWithGrades} 
										onChange={(e) => setOnlyWithGrades(e.target.checked)}
										className="hidden"
									/>
									<div className={`w-4 h-4 rounded-[4px] border ${onlyWithGrades ? 'bg-app-text border-app-text' : 'border-app-border bg-app-surface group-hover:border-app-muted'} transition-colors flex items-center justify-center`}>
										{onlyWithGrades && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
									</div>
									<span className="text-app-muted group-hover:text-app-text transition-colors">Только с оценками</span>
								</label>

								<label className="flex items-center gap-2.5 text-[14px] text-app-text cursor-pointer group">
									<input 
										type="checkbox" 
										checked={onlyAbsences} 
										onChange={(e) => setOnlyAbsences(e.target.checked)}
										className="hidden"
									/>
									<div className={`w-4 h-4 rounded-[4px] border ${onlyAbsences ? 'bg-app-text border-app-text' : 'border-app-border bg-app-surface group-hover:border-app-muted'} transition-colors flex items-center justify-center`}>
										{onlyAbsences && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
									</div>
									<span className="text-app-muted group-hover:text-app-text transition-colors">Только пропуски</span>
								</label>
							</div>
						</div>
					</div>

					<div className="px-4 xl:px-0">
						{activeTab === "exams" ? (
							<GradesExamList />
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
											scheduledLessons={weekLessons}
											selectedSubjectName={selectedSubjectName}
										/>
									</>
								)}
								{activeTab === "calendar" && <GradesCalendar byMonth={byMonth} />}
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
