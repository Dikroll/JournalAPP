import { useCallback, useMemo, useState } from "react";
import type { GradeEntryExpanded } from "@/entities/grades";
import { GRADE_DOT_LEGEND } from "@/entities/grades";
import { useMonthNav } from "@/shared/hooks";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { MonthGrid } from "@/shared/ui";
import {
	formatDateWithWeekday,
	getTodayString,
	toDateString,
} from "@/shared/utils";
import { GradeEntryRow } from "../../GradesList/ui/GradeEntryRow";
import { CalendarDayCell } from "./CalendarDayCell";
import { DesktopGradesList } from "./DesktopGradesList";

interface Props {
	byMonth: Record<string, Record<string, GradeEntryExpanded[]>>;
}

export function GradesCalendar({ byMonth }: Props) {
	const months = Object.keys(byMonth).sort();
	const defaultMonth =
		months[months.length - 1] ?? getTodayString().slice(0, 7);

	const { year, month, prevMonth, nextMonth } = useMonthNav(defaultMonth);
	const [selectedDate, setSelectedDate] = useState<string | null>(null);
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

			return (
				<CalendarDayCell
					dateStr={dateStr}
					day={day}
					isToday={isToday}
					isSelected={selectedDate === dateStr}
					entries={entries}
					onClick={handleDayClick}
				/>
			);
		},
		[datesWithData, selectedDate, handleDayClick],
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
					<div className="flex items-center justify-center h-full min-h-[200px] text-app-muted text-sm border-2 border-dashed border-app-border rounded-3xl">
						Выберите день в календаре для просмотра оценок
					</div>
				) : sortedSelectedEntries && sortedSelectedEntries.length > 0 ? (
					<div className="space-y-3">
						<div className="text-base font-bold text-app-text px-1 mb-4">
							{formatDateWithWeekday(selectedDate)}
						</div>
						{isDesktop ? (
							<DesktopGradesList entries={sortedSelectedEntries} />
						) : (
							<div
								className="bg-app-surface backdrop-blur-xl rounded-3xl p-4 border border-app-border space-y-2"
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
					<div className="flex items-center justify-center h-full min-h-[200px] text-app-muted text-sm border-2 border-dashed border-app-border rounded-3xl">
						Нет записей за {formatDateWithWeekday(selectedDate)}
					</div>
				)}
			</div>
		</div>
	);
}
