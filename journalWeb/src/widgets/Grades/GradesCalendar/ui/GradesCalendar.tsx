import { useCallback, useMemo, useState } from "react";
import type { GradeEntryExpanded } from "@/entities/grades";
import { GRADE_DOT_LEGEND, getGradeDotInfo, getGradeStyle } from "@/entities/grades";
import { useMonthNav } from "@/shared/hooks";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { MonthGrid } from "@/shared/ui";
import {
	formatDateWithWeekday,
	getTodayString,
	toDateString,
} from "@/shared/utils";
import { GradeEntryRow } from "../../GradesList/ui/GradeEntryRow";

interface Props {
	byMonth: Record<string, Record<string, GradeEntryExpanded[]>>;
}

export function GradesCalendar({ byMonth }: Props) {
	const months = Object.keys(byMonth).sort();
	const defaultMonth =
		months[months.length - 1] ?? getTodayString().slice(0, 7);

	const { year, month, prevMonth, nextMonth } = useMonthNav(defaultMonth);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
	const [hoveredDate, setHoveredDate] = useState<string | null>(null);
	const isDesktop = useIsDesktop();

	const handlePrevMonth = useCallback(() => {
		prevMonth();
		setSelectedDate(null);
	}, [prevMonth]);

	const handleNextMonth = useCallback(() => {
		nextMonth();
		setSelectedDate(null);
	}, [nextMonth]);

	const handleDayClick = useCallback((dateStr: string, hasData: boolean) => {
		if (!hasData) return;
		setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
	}, []);

	const currentMonth = toDateString(year, month, 1).slice(0, 7);
	const datesWithData = byMonth[currentMonth] ?? {};

	const selectedEntries = useMemo(
		() => (selectedDate ? (datesWithData[selectedDate] ?? []) : null),
		[selectedDate, datesWithData],
	);

	const sortedSelectedEntries = useMemo(
		() =>
			selectedEntries
				? [...selectedEntries].sort((a, b) => a.lesson_number - b.lesson_number)
				: null,
		[selectedEntries],
	);

	const renderDay = useCallback(
		({
			dateStr,
			day,
			isToday,
		}: {
			dateStr: string;
			day: number;
			isToday: boolean;
		}) => {
			const entries = datesWithData[dateStr] ?? [];
			const hasData = entries.length > 0;
			const isSelected = selectedDate === dateStr;
			const isHovered = hoveredDate === dateStr;
			const dotInfo = hasData ? getGradeDotInfo(entries) : null;
			const tooltip = dotInfo
				? `${formatDateWithWeekday(dateStr)}. ${dotInfo.label}: ${dotInfo.description}`
				: undefined;

			return (
				<button
					type="button"
					disabled={!hasData}
					onClick={() => handleDayClick(dateStr, hasData)}
					onMouseEnter={() => setHoveredDate(dateStr)}
					onMouseLeave={() => setHoveredDate(null)}
					onFocus={() => setHoveredDate(dateStr)}
					onBlur={() => setHoveredDate(null)}
					title={tooltip}
					aria-label={tooltip}
					className="relative flex items-center justify-center rounded-full text-xs font-semibold disabled:cursor-default"
					style={{
						width: 36,
						height: 36,
						WebkitTapHighlightColor: "transparent",
						background: isSelected
							? "var(--color-brand)"
							: isHovered
								? "var(--color-surface-hover)"
								: "transparent",
						color: isSelected
							? "#fff"
							: hasData
								? "var(--color-text)"
								: "var(--color-text-faint)",
					}}
				>
					{day}

					{isToday && !isSelected && (
						<span
							className="absolute inset-0 rounded-full pointer-events-none"
							style={{ boxShadow: "0 0 0 1.5px var(--color-brand)" }}
						/>
					)}

					{dotInfo && !isSelected && (
						<span
							className="absolute rounded-full pointer-events-none"
							style={{
								width: 4,
								height: 4,
								bottom: 3,
								left: "50%",
								transform: "translateX(-50%)",
								backgroundColor: dotInfo.color,
							}}
						/>
					)}
				</button>
			);
		},
		[datesWithData, selectedDate, hoveredDate, handleDayClick],
	);

	return (
		<div className="flex flex-col lg:flex-row gap-6 items-start">
			<div className="w-full lg:w-[400px] shrink-0 space-y-4">
				<MonthGrid
					year={year}
					month={month}
					onPrevMonth={handlePrevMonth}
					onNextMonth={handleNextMonth}
					renderDay={renderDay}
				/>

				{Object.keys(datesWithData).length === 0 && (
					<p className="text-app-muted text-sm text-center py-2">
						В этом месяце нет записей
					</p>
				)}

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs">
					{GRADE_DOT_LEGEND.map((item) => (
						<div
							key={item.label}
							className="flex items-center gap-1.5"
							title={`${item.label}: ${item.description}`}
						>
							<div
								className="w-1.5 h-1.5 rounded-full flex-shrink-0"
								style={{ backgroundColor: item.color }}
							/>
							<span className="text-app-text leading-snug">{item.label}</span>
						</div>
					))}
				</div>
			</div>

			<div className="flex-1 w-full">
				{!selectedDate ? (
					<div className="flex items-center justify-center h-full min-h-[200px] text-app-muted text-sm border-2 border-dashed border-app-border rounded-[24px]">
						Выберите день в календаре для просмотра оценок
					</div>
				) : sortedSelectedEntries && sortedSelectedEntries.length > 0 ? (
					<div className="space-y-3">
						<div className="text-base font-bold text-app-text px-1 mb-4">
							{formatDateWithWeekday(selectedDate)}
						</div>
						{isDesktop ? (
							<div className="bg-app-surface border border-app-border rounded-xl overflow-hidden">
								<div className="grid gap-4 px-4 py-2 text-[13px] font-medium text-app-muted border-b border-app-border bg-app-surface-strong" style={{ gridTemplateColumns: "30px 1fr 100px 120px" }}>
									<div>№</div>
									<div>Предмет</div>
									<div>Посещение</div>
									<div>Оценки</div>
								</div>
								{sortedSelectedEntries.map((entry, idx) => {
									let attendanceText = "—";
									let attendanceColor = "var(--color-text-muted)";
									if (entry.attended === "present") { attendanceText = "Посетил"; attendanceColor = "#10B981"; }
									if (entry.attended === "late") { attendanceText = "Опоздание"; attendanceColor = "#F59E0B"; }
									if (entry.attended === "absent") { attendanceText = "Не посетил"; attendanceColor = "#EF4444"; }

									return (
										<div key={idx} className="grid gap-4 px-4 py-3 border-b border-app-border last:border-0 items-center text-[13px]" style={{ gridTemplateColumns: "30px 1fr 100px 120px" }}>
											<div className="text-app-muted font-medium">{entry.lesson_number}</div>
											<div className="min-w-0 pr-4">
												<div className="text-app-text font-medium truncate">{entry.spec_name}</div>
												{entry.teacher && <div className="text-[11px] text-app-muted truncate mt-0.5">{entry.teacher}</div>}
											</div>
											<div style={{ color: attendanceColor }} className="font-medium">{attendanceText}</div>
											<div>
												{entry.flatMarks.length > 0 ? (
													<div className="flex flex-wrap gap-1.5">
														{entry.flatMarks.map((m, i) => (
															<div key={i} className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-white" style={getGradeStyle(m.value)}>{m.value}</div>
														))}
													</div>
												) : (
													<span className="text-app-muted">—</span>
												)}
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<div
								className="bg-app-surface backdrop-blur-xl rounded-[24px] p-4 border border-app-border space-y-2"
								style={{ boxShadow: "var(--shadow-card)" }}
							>
								{sortedSelectedEntries.map((entry, idx) => (
									<div key={`${entry.spec_id}-${entry.lesson_number}`}>
										{idx > 0 && (
											<div className="border-t border-app-border my-2" />
										)}
										<GradeEntryRow entry={entry} />
									</div>
								))}
							</div>
						)}
					</div>
				) : (
					<div className="flex items-center justify-center h-full min-h-[200px] text-app-muted text-sm border-2 border-dashed border-app-border rounded-[24px]">
						Нет записей за {formatDateWithWeekday(selectedDate)}
					</div>
				)}
			</div>
		</div>
	);
}
