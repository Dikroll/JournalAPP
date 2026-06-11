import {
	GRADE_TYPE_CONFIG,
	type GradeEntryExpanded,
	getGradeStyle,
} from "@/entities/grades";
import type { LessonItem } from "@/entities/schedule";
import { useLazyItems } from "@/shared/hooks";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { isWebPlatform } from "@/shared/lib/platform";
import { buildDisplayDays, isPastLesson } from "../lib/displayDaysFormatter";
import { DateCard } from "./DateCard";

interface Props {
	byDate: Array<{ date: string; items: GradeEntryExpanded[] }>;
	scheduledLessons?: LessonItem[];
	selectedSubjectName?: string | null;
}

export function GradesRecentList({
	byDate,
	scheduledLessons = [],
	selectedSubjectName = null,
}: Props) {
	const isDesktop = useIsDesktop();
	const showScheduledMask = isWebPlatform && isDesktop;
	const displayByDate = buildDisplayDays(
		byDate,
		showScheduledMask ? scheduledLessons : [],
		selectedSubjectName,
	);
	const { visibleCount, sentinelRef } = useLazyItems(
		displayByDate.length,
		20,
		15,
	);

	if (displayByDate.length === 0) {
		return (
			<p className="text-app-muted text-sm text-center py-8">Нет записей</p>
		);
	}

	const visibleDays = displayByDate.slice(0, visibleCount);

	if (!isDesktop) {
		return (
			<div className="space-y-4">
				{visibleDays.map(({ date, items }) => (
					<DateCard key={date} date={date} items={items} />
				))}

				{visibleCount < displayByDate.length && (
					<div ref={sentinelRef} className="space-y-3 pt-1 break-inside-avoid">
						{[0, 1].map((i) => (
							<div
								key={i}
								className="bg-app-surface rounded-3xl animate-pulse h-20"
							/>
						))}
					</div>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div
				className="grid gap-4 px-4 py-2 text-[13px] font-medium text-app-muted border-b border-app-border"
				style={{ gridTemplateColumns: "30px 1fr 100px 120px" }}
			>
				<div>№</div>
				<div>Предмет</div>
				<div>Посещение</div>
				<div>Оценки</div>
			</div>

			{visibleDays.map(({ date, items }) => {
				const dateObj = new Date(`${date}T00:00:00`);
				const dayMonth = dateObj.toLocaleDateString("ru-RU", {
					day: "numeric",
					month: "long",
				});
				const weekday = dateObj.toLocaleDateString("ru-RU", {
					weekday: "long",
				});
				const dateDisplay = `${dayMonth}, ${weekday}`;

				return (
					<div key={date} className="mb-6">
						<div className="text-[13px] font-bold text-app-text px-4 mb-3">
							{dateDisplay}
						</div>
						<div className="flex flex-col border border-app-border rounded-xl bg-app-surface overflow-hidden">
							{items.map((item, idx) => {
								const isGrade = item.type === "grade";
								const entry = isGrade ? item.entry : null;
								const lesson = isGrade ? null : item.lesson;

								const subjectName = isGrade
									? entry!.spec_name
									: lesson!.subject;
								const teacher = isGrade ? entry!.teacher : lesson!.teacher;
								const lessonNum = isGrade
									? entry!.lesson_number
									: lesson!.lesson;

								let attendanceText = "—";
								let attendanceColor = "var(--color-text-muted)";
								if (isGrade) {
									if (entry!.attended === "present") {
										attendanceText = "Посетил";
										attendanceColor = "#10B981";
									}
									if (entry!.attended === "late") {
										attendanceText = "Опоздание";
										attendanceColor = "#F59E0B";
									}
									if (entry!.attended === "absent") {
										attendanceText = "Не посетил";
										attendanceColor = "#EF4444";
									}
								} else {
									const isPast = isPastLesson(lesson!);
									attendanceText = isPast ? "Не посетил" : "Ожидает";
									attendanceColor = isPast
										? "#EF4444"
										: "var(--color-text-muted)";
								}

								return (
									<div
										key={idx}
										className="grid gap-4 px-4 py-3 border-b border-app-border last:border-0 items-center text-[13px]"
										style={{ gridTemplateColumns: "30px 1fr 100px 120px" }}
									>
										<div className="text-app-muted font-medium">
											{lessonNum}
										</div>
										<div className="min-w-0 pr-4">
											<div className="text-app-text font-medium truncate">
												{subjectName}
											</div>
											{teacher && (
												<div className="text-[11px] text-app-muted truncate mt-0.5">
													{teacher}
												</div>
											)}
										</div>
										<div
											style={{ color: attendanceColor }}
											className="font-medium"
										>
											{attendanceText}
										</div>
										<div>
											{isGrade && entry!.flatMarks.length > 0 ? (
												<div className="flex flex-wrap gap-1.5">
													{entry!.flatMarks.map((m, i) => (
														<div
															key={i}
															className="flex items-center gap-1.5 bg-app-surface-strong border border-app-border rounded px-1.5 py-1"
														>
															<span
																className="text-[10px] text-app-muted rounded"
																style={GRADE_TYPE_CONFIG[m.type]?.style}
															>
																{GRADE_TYPE_CONFIG[m.type]?.label || m.type}
															</span>
															<div
																className="w-5 h-5 rounded-[4px] flex items-center justify-center font-bold text-[11px] text-white"
																style={getGradeStyle(m.value)}
															>
																{m.value}
															</div>
														</div>
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
					</div>
				);
			})}

			{visibleCount < displayByDate.length && (
				<div ref={sentinelRef} className="space-y-3 pt-1 break-inside-avoid">
					{[0, 1].map((i) => (
						<div
							key={i}
							className="bg-app-surface rounded-xl border border-app-border animate-pulse h-16"
						/>
					))}
				</div>
			)}
		</div>
	);
}
