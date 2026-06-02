import { useState } from "react";
import { useScheduleMonth } from "@/entities/schedule";
import { useMonthNav } from "@/shared/hooks";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { MonthGrid } from "@/shared/ui";
import {
	formatDateLong,
	getDayOfWeek,
	getTodayString,
	toDateString,
} from "@/shared/utils";
import { LessonList } from "../../ScheduleList/ui/LessonList";

export function ScheduleCalendar() {
	const { year, month, prevMonth, nextMonth } = useMonthNav();
	const isDesktop = useIsDesktop();
	const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

	const dateFilter = toDateString(year, month, 1);
	const { lessons } = useScheduleMonth(dateFilter);

	const daysWithLessons = new Set(lessons.map((l) => l.date));
	const selectedLessons = lessons.filter((l) => l.date === selectedDate);

	return (
		<div className="schedule-calendar-layout">
			{/* Левая часть: сетка календаря */}
			<div className="schedule-calendar-layout__grid">
				<MonthGrid
					year={year}
					month={month}
					onPrevMonth={prevMonth}
					onNextMonth={nextMonth}
					renderDay={({ dateStr, day, isToday }) => {
						const dow = getDayOfWeek(dateStr);
						const isWeekend = dow === 0 || dow === 6;
						const hasLesson = daysWithLessons.has(dateStr);
						const isSelected = dateStr === selectedDate;
						const isActive = hasLesson && !isWeekend;

						return (
							<button
								type="button"
								disabled={!isActive}
								onClick={(e) => {
									e.preventDefault();
									setSelectedDate(dateStr);
								}}
								className={`
									group relative flex items-center justify-center
									rounded-full p-0
									disabled:cursor-default
									${isActive ? "cursor-pointer" : ""}
								`}
								style={{
									width: isDesktop ? 52 : 44,
									height: isDesktop ? 52 : 44,
								}}
							>
								<span
									className={`
										relative flex h-[34px] w-[34px] items-center justify-center
										rounded-full ${isDesktop ? "text-sm" : "text-xs"} font-semibold leading-none
										${isSelected ? "bg-brand text-white" : ""}
										${
											!isSelected && isActive
												? "text-app-text group-hover:bg-app-surface-hover"
												: ""
										}
										${!isSelected && !isActive ? "text-app-faint" : ""}
									`}
								>
									{day}

									{isToday && !isSelected && (
										<span
											className="absolute inset-0 rounded-full pointer-events-none"
											style={{
												boxShadow: "0 0 0 1.5px var(--color-brand)",
											}}
										/>
									)}
								</span>
							</button>
						);
					}}
				/>
			</div>

			{/* Правая часть: список пар выбранного дня */}
			{selectedDate && (
				<div className="schedule-calendar-layout__lessons">
					<p className="text-xs text-app-muted mb-3 px-1 capitalize font-medium">
						{formatDateLong(selectedDate)}
					</p>
					<LessonList lessons={selectedLessons} forDate={selectedDate} />
				</div>
			)}
		</div>
	);
}
