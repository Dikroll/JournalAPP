import {
	CalendarDays,
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDashboardCharts } from "@/entities/dashboard";
import {
	useGrades,
	useGradesBySubject,
	useGradesGroups,
} from "@/entities/grades";
import { useScheduleWeek } from "@/entities/schedule";
import { useSubjects } from "@/entities/subject";
import { RefreshGradesButton } from "@/features/refreshGrades";
import { SpecSelector } from "@/features/selectSpec";
import { PAGE_TITLES, pageConfig } from "@/shared/config";

import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { ErrorView, PageHeader, SkeletonList } from "@/shared/ui";
import {
	formatDateShort,
	getDaysInMonth,
	getFirstDayOfMonth,
	getTodayString,
	RU_DAYS_SHORT,
	RU_MONTHS,
	toDateString,
} from "@/shared/utils";
import { GoalsSummaryCard } from "@/widgets/Goals/GoalsSummaryCard/ui/GoalsSummaryCard";
import { DesktopSubjectsWidget } from "@/widgets/Grades/DesktopSubjectsWidget";
import { GradesCalendar } from "@/widgets/Grades/GradesCalendar/ui/GradesCalendar";
import { GradesCharts } from "@/widgets/Grades/GradesCharts/ui/GradesCharts";
import { GradesExamList } from "@/widgets/Grades/GradesList/ui/GradesExamList";
import { GradesRecentList } from "@/widgets/Grades/GradesList/ui/GradesRecentList";
import { GradesSubjectList } from "@/widgets/Grades/GradesList/ui/GradesSubjectList";
import type { Tab } from "@/widgets/Grades/GradesTabs/ui/GradesTabs";
import { GradesTabs } from "@/widgets/Grades/GradesTabs/ui/GradesTabs";

const GRADE_OPTIONS = [
	{ value: "all", label: "Все оценки" },
	{ value: "5", label: "Только 5" },
	{ value: "4", label: "Только 4" },
	{ value: "3", label: "Только 3" },
	{ value: "2", label: "Только 2" },
] as const;

function useCloseOnOutsideClick<T extends HTMLElement>(
	isOpen: boolean,
	onClose: () => void,
) {
	const ref = useRef<T | null>(null);

	useEffect(() => {
		if (!isOpen) return;

		const handlePointerDown = (event: PointerEvent) => {
			if (!ref.current?.contains(event.target as Node)) {
				onClose();
			}
		};

		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [isOpen, onClose]);

	return ref;
}

function getMonthFromDate(date: string) {
	const parsed = date ? new Date(`${date}T00:00:00`) : new Date();
	return {
		year: parsed.getFullYear(),
		month: parsed.getMonth(),
	};
}

function DesktopDateRangePicker({
	startDate,
	endDate,
	onStartDateChange,
	onEndDateChange,
}: {
	startDate: string;
	endDate: string;
	onStartDateChange: (date: string) => void;
	onEndDateChange: (date: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const [{ year, month }, setVisibleMonth] = useState(() =>
		getMonthFromDate(endDate || startDate),
	);
	const ref = useCloseOnOutsideClick<HTMLDivElement>(
		open,
		useCallback(() => setOpen(false), []),
	);
	const today = useMemo(() => getTodayString(), []);
	const daysInMonth = getDaysInMonth(year, month);
	const firstDay = getFirstDayOfMonth(year, month);
	const cells = Array.from({ length: 42 }, (_, cellIndex) => {
		const dayIndex = cellIndex - firstDay;
		const day = dayIndex >= 0 && dayIndex < daysInMonth ? dayIndex + 1 : null;
		return {
			day,
			key: day
				? toDateString(year, month, day)
				: `empty-${year}-${month}-${cellIndex}`,
		};
	});

	const moveMonth = useCallback((step: number) => {
		setVisibleMonth((current) => {
			const next = new Date(current.year, current.month + step, 1);
			return { year: next.getFullYear(), month: next.getMonth() };
		});
	}, []);

	const handleDayClick = useCallback(
		(dateStr: string) => {
			if (!startDate || (startDate && endDate)) {
				onStartDateChange(dateStr);
				onEndDateChange("");
				return;
			}

			if (dateStr < startDate) {
				onEndDateChange(startDate);
				onStartDateChange(dateStr);
				return;
			}

			onEndDateChange(dateStr);
			setOpen(false);
		},
		[startDate, endDate, onStartDateChange, onEndDateChange],
	);

	const displayLabel =
		startDate || endDate
			? `${startDate ? formatDateShort(startDate) : "..."} - ${
					endDate ? formatDateShort(endDate) : "..."
				}`
			: "Выберите период";

	return (
		<div ref={ref} className="relative shrink-0">
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				className="flex h-12 items-center gap-2 rounded-2xl border border-app-border bg-app-surface px-4 text-sm font-medium text-app-text transition-colors hover:bg-app-surface-hover"
			>
				<CalendarDays size={17} className="text-app-muted" />
				<span className="min-w-[166px] text-left">{displayLabel}</span>
				<ChevronDown
					size={16}
					className={`text-app-muted transition-transform ${open ? "rotate-180" : ""}`}
				/>
			</button>

			{open && (
				<div
					className="absolute left-0 top-full z-50 mt-2 w-[320px] rounded-2xl border border-app-border p-4 shadow-2xl"
					style={{
						backgroundColor: "var(--color-bg)",
						boxShadow: "0 24px 60px rgba(0, 0, 0, 0.28)",
					}}
				>
					<div className="mb-4 flex items-center justify-between">
						<button
							type="button"
							onClick={() => moveMonth(-1)}
							className="flex h-9 w-9 items-center justify-center rounded-xl text-app-muted transition-colors hover:bg-app-surface-hover hover:text-app-text"
							style={{
								backgroundColor:
									"color-mix(in srgb, var(--color-bg) 88%, var(--color-text) 12%)",
							}}
							title="Предыдущий месяц"
						>
							<ChevronLeft size={16} />
						</button>
						<div className="text-sm font-semibold text-app-text">
							{RU_MONTHS[month]} {year}
						</div>
						<button
							type="button"
							onClick={() => moveMonth(1)}
							className="flex h-9 w-9 items-center justify-center rounded-xl text-app-muted transition-colors hover:bg-app-surface-hover hover:text-app-text"
							style={{
								backgroundColor:
									"color-mix(in srgb, var(--color-bg) 88%, var(--color-text) 12%)",
							}}
							title="Следующий месяц"
						>
							<ChevronRight size={16} />
						</button>
					</div>

					<div className="grid grid-cols-7 gap-1">
						{RU_DAYS_SHORT.map((day) => (
							<div
								key={day}
								className="py-1 text-center text-[11px] font-medium text-app-muted"
							>
								{day}
							</div>
						))}
						{cells.map(({ day, key }) => {
							if (day === null) {
								return <div key={key} className="h-9" />;
							}

							const dateStr = toDateString(year, month, day);
							const isStart = dateStr === startDate;
							const isEnd = dateStr === endDate;
							const inRange =
								Boolean(startDate && endDate) &&
								dateStr > startDate &&
								dateStr < endDate;
							const isToday = dateStr === today;

							return (
								<button
									key={dateStr}
									type="button"
									onClick={() => handleDayClick(dateStr)}
									className={`h-9 rounded-xl text-xs font-semibold transition-colors ${
										isStart || isEnd
											? "bg-brand text-white"
											: inRange
												? "bg-brand/10 text-app-text ring-1 ring-brand/10"
												: "text-app-muted hover:bg-app-surface-hover hover:text-app-text"
									}`}
								>
									<span
										className={
											isToday && !isStart && !isEnd
												? "inline-flex h-6 w-6 items-center justify-center rounded-full border border-brand"
												: ""
										}
									>
										{day}
									</span>
								</button>
							);
						})}
					</div>

					<div className="mt-4 flex items-center justify-between border-t border-app-border pt-3">
						<button
							type="button"
							onClick={() => {
								onStartDateChange("");
								onEndDateChange("");
								setOpen(false);
							}}
							className="text-xs font-medium text-app-muted transition-colors hover:text-app-text"
						>
							Очистить
						</button>
						<button
							type="button"
							onClick={() => {
								onStartDateChange(today);
								onEndDateChange(today);
								setVisibleMonth(getMonthFromDate(today));
								setOpen(false);
							}}
							className="text-xs font-medium text-brand transition-colors hover:text-app-text"
						>
							Сегодня
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

function DesktopGradeFilter({
	value,
	onChange,
}: {
	value: string;
	onChange: (value: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const ref = useCloseOnOutsideClick<HTMLDivElement>(
		open,
		useCallback(() => setOpen(false), []),
	);
	const selected = GRADE_OPTIONS.find((option) => option.value === value);

	return (
		<div ref={ref} className="relative shrink-0">
			<button
				type="button"
				onClick={() => setOpen((current) => !current)}
				className="flex h-12 min-w-[146px] items-center justify-between gap-3 rounded-2xl border border-app-border bg-app-surface px-4 text-sm font-semibold text-app-text transition-colors hover:bg-app-surface-hover"
			>
				<span>
					{selected?.value === "all"
						? selected.label
						: `Оценки: ${selected?.value}`}
				</span>
				<ChevronDown
					size={16}
					className={`text-app-muted transition-transform ${open ? "rotate-180" : ""}`}
				/>
			</button>

			{open && (
				<div
					className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-2xl border border-app-border py-1"
					style={{
						backgroundColor: "var(--color-bg)",
						boxShadow: "0 24px 60px rgba(0, 0, 0, 0.28)",
					}}
				>
					{GRADE_OPTIONS.map((option) => {
						const isSelected = option.value === value;
						return (
							<button
								key={option.value}
								type="button"
								onClick={() => {
									onChange(option.value);
									setOpen(false);
								}}
								className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
									isSelected
										? "bg-app-surface-strong text-app-text"
										: "text-app-muted hover:bg-app-surface-hover hover:text-app-text"
								}`}
							>
								<span>{option.label}</span>
								{isSelected && <Check size={15} className="text-brand" />}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

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
							<div className="mb-6 rounded-2xl border border-app-border bg-app-surface/40 p-3">
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
											className="flex h-12 w-12 items-center justify-center rounded-2xl border border-app-border bg-app-surface text-app-muted transition-colors hover:bg-app-surface-hover hover:text-app-text"
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
											scheduledLessons={weekLessons}
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
