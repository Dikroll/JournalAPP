import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";
import {
	getGapBetweenLessons,
	getLessonTimeLabel,
	getScheduleTimeInfo,
	getWeekDays,
	groupLessonsByDate,
	shiftWeek,
	useScheduleWeek,
} from "@/entities/schedule";
import { toMinutes, useCurrentMinutes } from "@/shared/hooks";
import { pluralizeLessons } from "@/shared/lib";
import { Badge, IconButton } from "@/shared/ui";
import {
	formatDateCompact,
	getTodayString,
	RU_DAYS_SHORT,
} from "@/shared/utils";
import { GapIndicator } from "../../ScheduleList/ui/GapIndicator";
import { LessonCard } from "../../ScheduleList/ui/LessonCard";

const LOADING_SKELETONS = [
	{ id: "primary", height: 160 },
	{ id: "secondary-1", height: 120 },
	{ id: "secondary-2", height: 120 },
	{ id: "secondary-3", height: 120 },
	{ id: "secondary-4", height: 120 },
];

function formatWeekRange(days: string[]): string {
	if (days.length < 2) return "";
	const first = formatDateCompact(days[0]);
	const last = formatDateCompact(days[6]);
	return `${first} — ${last}`;
}

export function ScheduleWeekView() {
	const today = getTodayString();
	const [anchor, setAnchor] = useState(today);
	const { lessons, status } = useScheduleWeek(anchor);
	const nowMinutes = useCurrentMinutes();
	const weekDays = getWeekDays(anchor);

	const isCurrentWeek = weekDays.includes(today);

	const goPrev = useCallback(() => setAnchor((a) => shiftWeek(a, -1)), []);
	const goNext = useCallback(() => setAnchor((a) => shiftWeek(a, 1)), []);
	const goToday = useCallback(() => setAnchor(today), [today]);

	if (status === "loading" && lessons.length === 0) {
		return (
			<div className="flex flex-col gap-3">
				{LOADING_SKELETONS.map((skeleton) => (
					<div
						key={skeleton.id}
						className="bg-app-surface rounded-[24px] border border-app-border animate-pulse"
						style={{ height: skeleton.height }}
					/>
				))}
			</div>
		);
	}

	if (status === "error" && lessons.length === 0) {
		return (
			<p className="text-status-overdue text-sm text-center py-6">
				Не удалось загрузить расписание на неделю
			</p>
		);
	}

	const byDate = groupLessonsByDate(lessons, weekDays);
	const weekdayDates = weekDays.slice(0, 5);
	const weekendDatesWithLessons = weekDays
		.slice(5)
		.filter((dateStr) => (byDate[dateStr] ?? []).length > 0);
	const visibleDays = [...weekdayDates, ...weekendDatesWithLessons];

	return (
		<div className="flex flex-col gap-5">
			{/* Week navigation */}
			<div className="flex items-center justify-between">
				<IconButton
					icon={<ChevronLeft size={18} />}
					onClick={goPrev}
					size="md"
					shape="square"
					variant="surface"
					aria-label="Предыдущая неделя"
				/>

				<button
					type="button"
					onClick={isCurrentWeek ? undefined : goToday}
					className="text-center"
					disabled={isCurrentWeek}
				>
					<p className="text-sm font-semibold text-app-text">
						{formatWeekRange(weekDays)}
					</p>
					{!isCurrentWeek && (
						<p className="text-[11px] text-brand font-medium mt-0.5">
							К текущей неделе
						</p>
					)}
				</button>

				<IconButton
					icon={<ChevronRight size={18} />}
					onClick={goNext}
					size="md"
					shape="square"
					variant="surface"
					aria-label="Следующая неделя"
				/>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-3 md:items-start">
				{visibleDays.map((dateStr) => {
					const actualIdx = weekDays.indexOf(dateStr);
					const dayLessons = byDate[dateStr] ?? [];
					const isToday = dateStr === today;
					const todayTimeInfo = isToday
						? getScheduleTimeInfo(dayLessons, nowMinutes)
						: null;
					const isPast = dateStr < today;
					const isEmpty = dayLessons.length === 0;

					return (
						<section
							key={dateStr}
							className={`w-full min-w-0 bg-app-surface rounded-[24px] p-3 border border-app-border ${isPast && !isToday ? "opacity-60" : ""}`}
							style={{ boxShadow: "var(--shadow-card)" }}
						>
							{/* Section header */}
							<div className="flex items-center justify-between mb-3 px-1">
								<div className="flex items-center gap-2">
									<span
										className="text-xs font-bold w-6 shrink-0"
										style={{
											color: isToday
												? "var(--color-brand)"
												: "var(--color-text-muted)",
										}}
									>
										{RU_DAYS_SHORT[actualIdx]}
									</span>
									<span className="text-sm font-semibold text-app-text">
										{formatDateCompact(dateStr)}
									</span>
									{isToday && (
										<Badge variant="brand" size="xs">
											Сегодня
										</Badge>
									)}
								</div>
								{!isEmpty ? (
									<span className="text-xs text-app-muted">
										{pluralizeLessons(dayLessons.length)}
									</span>
								) : (
									<span className="text-xs text-app-faint">Нет пар</span>
								)}
							</div>

							{/* Lessons */}
							{!isEmpty ? (
								<ul className="schedule-week-day__lessons flex flex-col gap-3">
									{dayLessons.map((lesson, i) => (
										<li
											key={`${lesson.started_at}-${lesson.room}`}
											className="schedule-week-day__lesson flex flex-col"
										>
											{i > 0 && (
												<div className="schedule-week-day__gap">
													<GapIndicator
														gap={getGapBetweenLessons(
															dayLessons[i - 1],
															lesson,
														)}
													/>
												</div>
											)}
											<LessonCard
												lesson={lesson}
												variant="weekDesktop"
												isCurrent={
													isToday &&
													nowMinutes >= toMinutes(lesson.started_at) &&
													nowMinutes <= toMinutes(lesson.finished_at)
												}
												timeLabel={getLessonTimeLabel(todayTimeInfo, lesson)}
											/>
										</li>
									))}
								</ul>
							) : (
								<p className="text-app-muted text-sm px-1 py-2 text-center">
									Пар нет
								</p>
							)}
						</section>
					);
				})}
			</div>
		</div>
	);
}
