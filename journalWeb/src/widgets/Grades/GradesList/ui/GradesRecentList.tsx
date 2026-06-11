import { Clock, GraduationCap, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getGradeStyle, type GradeEntryExpanded } from "@/entities/grades";
import type { LessonItem } from "@/entities/schedule";
import { useLazyItems } from "@/shared/hooks";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { isWebPlatform } from "@/shared/lib/platform";
import {
	formatDateRelative,
	formatWeekLabel,
	getStartOfWeek,
	getTodayString,
	toDateString,
} from "@/shared/utils";
import { GradeEntryRow } from "./GradeEntryRow";

interface Props {
	byDate: Array<{ date: string; items: GradeEntryExpanded[] }>;
	scheduledLessons?: LessonItem[];
	selectedSubjectName?: string | null;
}

type DisplayItem =
	| { type: "grade"; entry: GradeEntryExpanded }
	| { type: "pending"; lesson: LessonItem };

interface DisplayDay {
	date: string;
	items: DisplayItem[];
}

function normalizeSubject(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function toMinutes(value: string): number {
	const [hours, minutes] = value.split(":").map(Number);
	if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
	return hours * 60 + minutes;
}

function isPastLesson(lesson: LessonItem): boolean {
	const today = getTodayString();
	if (lesson.date < today) return true;
	if (lesson.date > today) return false;

	const now = new Date();
	const currentMinutes = now.getHours() * 60 + now.getMinutes();
	return toMinutes(lesson.finished_at) <= currentMinutes;
}

function hasVisitForLesson(
	lesson: LessonItem,
	entries: GradeEntryExpanded[],
): boolean {
	const subject = normalizeSubject(lesson.subject);
	return entries.some(
		(entry) =>
			entry.date === lesson.date &&
			entry.lesson_number === lesson.lesson &&
			normalizeSubject(entry.spec_name) === subject,
	);
}

function buildDisplayDays(
	byDate: Array<{ date: string; items: GradeEntryExpanded[] }>,
	scheduledLessons: LessonItem[] = [],
	selectedSubjectName: string | null = null,
): DisplayDay[] {
	const days = new Map<string, DisplayItem[]>();
	const entriesByDate = new Map<string, GradeEntryExpanded[]>();
	const selectedSubject = selectedSubjectName
		? normalizeSubject(selectedSubjectName)
		: null;

	for (const day of byDate) {
		entriesByDate.set(day.date, day.items);
		days.set(
			day.date,
			day.items.map((entry) => ({ type: "grade", entry })),
		);
	}

	for (const lesson of scheduledLessons) {
		if (
			selectedSubject &&
			normalizeSubject(lesson.subject) !== selectedSubject
		) {
			continue;
		}

		const entries = entriesByDate.get(lesson.date) ?? [];
		if (hasVisitForLesson(lesson, entries)) continue;

		const list = days.get(lesson.date) ?? [];
		list.push({ type: "pending", lesson });
		days.set(lesson.date, list);
	}

	return Array.from(days.entries())
		.sort(([a], [b]) => b.localeCompare(a))
		.map(([date, items]) => ({
			date,
			items: [...items].sort((a, b) => {
				const aLesson =
					a.type === "grade" ? a.entry.lesson_number : a.lesson.lesson;
				const bLesson =
					b.type === "grade" ? b.entry.lesson_number : b.lesson.lesson;
				return aLesson - bLesson;
			}),
		}));
}

function PendingLessonRow({ lesson }: { lesson: LessonItem }) {
	const isPast = isPastLesson(lesson);

	return (
		<div
			className="grid gap-2 py-2"
			style={{ gridTemplateColumns: "1fr auto" }}
		>
			<div className="min-w-0">
				<p className="text-sm font-semibold text-app-text leading-snug line-clamp-2">
					{lesson.subject}
				</p>

				{lesson.teacher && (
					<div className="flex items-center gap-1.5 mt-1">
						<GraduationCap size={13} className="text-app-text flex-shrink-0" />
						<p className="text-xs text-app-muted leading-snug">
							{lesson.teacher}
						</p>
					</div>
				)}

				<div className="flex items-center flex-wrap gap-1.5 mt-1.5 text-[11px] text-app-muted font-medium">
					<span className="flex items-center gap-1">
						<Clock size={11} className="flex-shrink-0" />
						{isPast ? "Ожидает отметки" : "По расписанию"}
					</span>
					{lesson.room && (
						<span className="flex items-center gap-1 text-app-faint">
							<MapPin size={11} className="flex-shrink-0" />
							{lesson.room}
						</span>
					)}
				</div>
			</div>

			<div className="flex flex-col items-end gap-1.5">
				<span className="text-[11px] font-semibold text-app-muted bg-app-surface-strong border border-app-border rounded-md px-1.5 py-0.5 whitespace-nowrap">
					Пара {lesson.lesson}
				</span>

				<div className="w-8 h-8 rounded-xl flex items-center justify-center bg-app-surface-strong border border-app-border">
					<Clock size={16} className="text-app-muted" />
				</div>
			</div>
		</div>
	);
}

function DateCard({ date, items }: { date: string; items: DisplayItem[] }) {
	const [visible, setVisible] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = cardRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "300px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const isWeb = isWebPlatform;

	const estimatedHeight = 56 + items.length * 68;

	return (
		<div className="space-y-2 break-inside-avoid mb-4">
			<div className="text-sm font-medium text-app-muted px-1">
				{formatDateRelative(date)}
			</div>
			<div
				ref={cardRef}
				className={`bg-app-surface ${isWeb ? "rounded-2xl" : "rounded-[24px]"} p-3 border border-app-border`}
				style={{
					boxShadow: "var(--shadow-card)",
					minHeight: visible && items.length > 0 ? undefined : estimatedHeight,
				}}
			>
				{visible && items.length === 0 && (
					<div className="flex items-center justify-center h-full min-h-[56px] text-app-muted text-sm">
						Пар не было
					</div>
				)}
				{visible &&
					items.length > 0 &&
					items.map((item, idx) => (
						<div
							key={
								item.type === "grade"
									? `${item.entry.date}-${item.entry.lesson_number}-${item.entry.spec_id}-${idx}`
									: `${item.lesson.date}-${item.lesson.lesson}-${item.lesson.subject}-${idx}`
							}
						>
							{idx > 0 && <div className="border-t border-app-border my-1" />}
							{item.type === "grade" ? (
								<GradeEntryRow entry={item.entry} />
							) : (
								<PendingLessonRow lesson={item.lesson} />
							)}
						</div>
					))}
			</div>
		</div>
	);
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
								className="bg-app-surface rounded-[24px] animate-pulse h-20"
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
				style={{ gridTemplateColumns: "30px 60px 1fr 100px 120px" }}
			>
				<div>№</div>
				<div>Время</div>
				<div>Предмет</div>
				<div>Посещение</div>
				<div>Оценки</div>
			</div>

			{visibleDays.map(({ date, items }) => {
				const dateObj = new Date(`${date}T00:00:00`);
				const dayMonth = dateObj.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
				const weekday = dateObj.toLocaleDateString("ru-RU", { weekday: "long" });
				const dateDisplay = `${dayMonth}, ${weekday}`;

				return (
					<div key={date} className="mb-6">
						<div className="text-[13px] font-bold text-app-text px-4 mb-3">{dateDisplay}</div>
						<div className="flex flex-col border border-app-border rounded-xl bg-app-surface overflow-hidden">
							{items.map((item, idx) => {
								const isGrade = item.type === "grade";
								const entry = isGrade ? item.entry : null;
								const lesson = isGrade ? null : item.lesson;

								const time = lesson?.started_at || scheduledLessons.find(l => l.date === entry?.date && l.lesson === entry?.lesson_number)?.started_at || "—";
								const subjectName = isGrade ? entry!.spec_name : lesson!.subject;
								const teacher = isGrade ? entry!.teacher : lesson!.teacher;
								const lessonNum = isGrade ? entry!.lesson_number : lesson!.lesson;

								let attendanceText = "—";
								let attendanceColor = "var(--color-text-muted)";
								if (isGrade) {
									if (entry!.attended === "present") { attendanceText = "Посетил"; attendanceColor = "#10B981"; }
									if (entry!.attended === "late") { attendanceText = "Опоздание"; attendanceColor = "#F59E0B"; }
									if (entry!.attended === "absent") { attendanceText = "Не посетил"; attendanceColor = "#EF4444"; }
								} else {
									const isPast = isPastLesson(lesson!);
									attendanceText = isPast ? "Не посетил" : "Ожидает";
									attendanceColor = isPast ? "#EF4444" : "var(--color-text-muted)";
								}

								return (
									<div 
										key={idx} 
										className="grid gap-4 px-4 py-3 border-b border-app-border last:border-0 items-center text-[13px]" 
										style={{ gridTemplateColumns: "30px 60px 1fr 100px 120px" }}
									>
										<div className="text-app-muted font-medium">{lessonNum}</div>
										<div className="text-app-muted">{time}</div>
										<div className="min-w-0 pr-4">
											<div className="text-app-text font-medium truncate">{subjectName}</div>
											{teacher && <div className="text-[11px] text-app-muted truncate mt-0.5">{teacher}</div>}
										</div>
										<div style={{ color: attendanceColor }} className="font-medium">{attendanceText}</div>
										<div>
											{isGrade && entry!.flatMarks.length > 0 ? (
												<div className="flex flex-wrap gap-1.5">
													{entry!.flatMarks.map((m, i) => (
														<div 
															key={i} 
															className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs text-white" 
															style={getGradeStyle(m.value)}
														>
															{m.value}
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
