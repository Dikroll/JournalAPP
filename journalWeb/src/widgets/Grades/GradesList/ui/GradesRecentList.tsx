import { Clock, GraduationCap, MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { GradeEntryExpanded } from "@/entities/grades";
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
		if (!isPastLesson(lesson)) continue;
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
						Ожидает отметки
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
	const displayByDate = buildDisplayDays(
		byDate,
		scheduledLessons,
		selectedSubjectName,
	);
	const { visibleCount, sentinelRef } = useLazyItems(
		displayByDate.length,
		20,
		15,
	);
	const isDesktop = useIsDesktop();

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

	const weeksMap = new Map<
		string,
		Array<{ date: string; items: DisplayItem[] }>
	>();

	visibleDays.forEach((day) => {
		const weekStart = getStartOfWeek(day.date);
		if (!weeksMap.has(weekStart)) {
			weeksMap.set(weekStart, []);
		}
		weeksMap.get(weekStart)?.push(day);
	});

	const weeks = Array.from(weeksMap.entries());

	return (
		<div className="space-y-8">
			{weeks.map(([weekStart, days]) => {
				let displayDays = days;

				if (isDesktop) {
					// Pad to 5 days (Monday to Friday)
					const paddedDays: Array<{ date: string; items: DisplayItem[] }> = [];
					const start = new Date(`${weekStart}T00:00:00`);
					for (let i = 0; i < 5; i++) {
						const d = new Date(start);
						d.setDate(d.getDate() + i);
						const dateStr = toDateString(
							d.getFullYear(),
							d.getMonth(),
							d.getDate(),
						);
						const existingDay = days.find((day) => day.date === dateStr);
						if (existingDay) {
							paddedDays.push(existingDay);
						} else {
							paddedDays.push({ date: dateStr, items: [] });
						}
					}
					displayDays = paddedDays;
				}

				return (
					<div key={weekStart} className="space-y-4">
						<h3 className="text-base font-bold text-app-text px-1">
							{formatWeekLabel(weekStart)}
						</h3>
						<div className="grid grid-cols-5 gap-4">
							{displayDays.map(({ date, items }) => (
								<DateCard key={date} date={date} items={items} />
							))}
						</div>
					</div>
				);
			})}

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
