import { CheckCircle2 } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import type { LessonItem } from "@/entities/schedule";
import { getGapBetweenLessons } from "@/entities/schedule/lib/scheduleGaps";
import { toMinutes, useCurrentMinutes } from "@/shared/hooks";
import { InlineImage } from "@/shared/ui";
import { getTodayString } from "@/shared/utils";
import { GapIndicator } from "./GapIndicator";
import type { LessonCardVariant } from "./LessonCard";
import { LessonCard } from "./LessonCard";

interface Props {
	lessons: LessonItem[];
	forDate?: string;
	compact?: boolean;
	cardVariant?: LessonCardVariant;
	limit?: number;
}

export function LessonList({
	lessons,
	forDate,
	compact = false,
	cardVariant = "default",
	limit,
}: Props) {
	const nowMinutes = useCurrentMinutes();
	const todayStr = getTodayString();
	const isToday = !forDate || forDate === todayStr;
	const emptyText = isToday ? "Пар сегодня нет" : "Пар на этот день нет";
	const sorted = [...lessons].sort((a, b) => a.lesson - b.lesson);
	const visibleLessons = limit ? sorted.slice(0, limit) : sorted;
	const hiddenCount = sorted.length - visibleLessons.length;
	const isHomeDesktop = cardVariant === "homeDesktop";
	const showCompletionMarker = isHomeDesktop && hiddenCount === 0;
	const completionDotIndex = visibleLessons.length;
	const lastVisibleLesson = visibleLessons[visibleLessons.length - 1];
	const timelineRef = useRef<HTMLDivElement | null>(null);
	const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);
	const [timelineMetrics, setTimelineMetrics] = useState({
		top: 18,
		height: 0,
	});
	const isLessonStarted = (lesson: LessonItem) => {
		if (lesson.date < todayStr) return true;
		if (lesson.date > todayStr) return false;
		return nowMinutes >= toMinutes(lesson.started_at);
	};

	const activeTimelineDots = visibleLessons.filter(isLessonStarted).length;
	const isCompletionActive = lastVisibleLesson
		? lastVisibleLesson.date < todayStr ||
			(lastVisibleLesson.date === todayStr &&
				nowMinutes > toMinutes(lastVisibleLesson.finished_at))
		: false;
	const completionColor = isCompletionActive ? "#3B82F6" : "#64748B";
	const activeTimelineMarkers =
		activeTimelineDots + (showCompletionMarker && isCompletionActive ? 1 : 0);
	const timelineMarkerCount =
		visibleLessons.length + (showCompletionMarker ? 1 : 0);
	const timelineFillPercent =
		timelineMarkerCount <= 1
			? activeTimelineMarkers > 0
				? 100
				: 0
			: Math.max(
					0,
					Math.min(
						100,
						((activeTimelineMarkers - 1) / (timelineMarkerCount - 1)) * 100,
					),
				);

	useLayoutEffect(() => {
		if (!isHomeDesktop || visibleLessons.length === 0) return;

		const updateTimelineMetrics = () => {
			const container = timelineRef.current;
			const firstDot = dotRefs.current[0];
			const lastDot =
				dotRefs.current[
					showCompletionMarker ? completionDotIndex : visibleLessons.length - 1
				];
			if (!container || !firstDot || !lastDot) return;

			const containerRect = container.getBoundingClientRect();
			const firstDotRect = firstDot.getBoundingClientRect();
			const lastDotRect = lastDot.getBoundingClientRect();
			const top = firstDotRect.top - containerRect.top;
			const height = Math.max(0, lastDotRect.top - firstDotRect.top);

			setTimelineMetrics((current) =>
				Math.abs(current.top - top) < 0.5 &&
				Math.abs(current.height - height) < 0.5
					? current
					: { top, height },
			);
		};

		updateTimelineMetrics();

		const resizeObserver =
			typeof ResizeObserver !== "undefined"
				? new ResizeObserver(updateTimelineMetrics)
				: null;
		if (timelineRef.current && resizeObserver) {
			resizeObserver.observe(timelineRef.current);
		}
		window.addEventListener("resize", updateTimelineMetrics);

		return () => {
			resizeObserver?.disconnect();
			window.removeEventListener("resize", updateTimelineMetrics);
		};
	}, [completionDotIndex, isHomeDesktop, showCompletionMarker, visibleLessons]);

	if (lessons.length === 0)
		return (
			<div className="flex flex-col items-center gap-3 py-4">
				<InlineImage
					src="/homework.svg"
					alt="Нет пар"
					width={300}
					height={300}
				/>
				<p className="text-app-muted text-sm text-center">{emptyText}</p>
			</div>
		);

	return (
		<div className="relative flex flex-col min-h-0 w-full h-full">
			<div
				className={`relative z-10 flex flex-col flex-1 min-h-0 ${isHomeDesktop ? "gap-0" : compact ? "gap-1.5" : "gap-3"}`}
			>
				<div ref={timelineRef} className="relative shrink-0">
					{isHomeDesktop && timelineMetrics.height > 0 && (
						<div
							className="absolute left-[16px] w-[2px] -translate-x-1/2 rounded-full z-0"
							style={{
								top: `${timelineMetrics.top}px`,
								height: `${timelineMetrics.height}px`,
								background: `linear-gradient(to bottom, #3B82F6 0%, #3B82F6 ${timelineFillPercent}%, var(--color-border-strong) ${timelineFillPercent}%, var(--color-border-strong) 100%)`,
								boxShadow:
									timelineFillPercent > 0
										? "0 0 12px rgba(59, 130, 246, 0.35)"
										: "none",
							}}
						/>
					)}
					<ul
						className={`relative z-10 flex flex-col ${isHomeDesktop ? "gap-0" : compact ? "gap-1.5" : "gap-3"}`}
					>
						{visibleLessons.map((lesson, i) => {
							const previousLesson = visibleLessons[i - 1];
							const previousGap = previousLesson
								? getGapBetweenLessons(previousLesson, lesson)
								: null;
							const hasPreviousGapMarker =
								previousGap &&
								previousGap.minutes > 0 &&
								previousGap.type !== "break";
							const dotOffset = (hasPreviousGapMarker ? 32 : 0) + 18;
							const isCurrent =
								isToday &&
								nowMinutes >= toMinutes(lesson.started_at) &&
								nowMinutes <= toMinutes(lesson.finished_at);
							const isPast =
								lesson.date < todayStr ||
								(isToday && nowMinutes > toMinutes(lesson.finished_at));

							return (
								<li
									key={`${lesson.started_at}-${lesson.room}`}
									className="relative flex flex-col min-h-0"
								>
									{isHomeDesktop && (
										<span
											ref={(node) => {
												dotRefs.current[i] = node;
											}}
											className="pointer-events-none absolute left-[16px] h-0 w-0"
											style={{ top: `${dotOffset}px` }}
											aria-hidden="true"
										/>
									)}
									{i > 0 && (
										<GapIndicator
											gap={
												previousGap ??
												getGapBetweenLessons(sorted[i - 1], lesson)
											}
											compact={compact}
											variant={cardVariant}
											isActive={
												isToday &&
												nowMinutes > toMinutes(sorted[i - 1].finished_at) &&
												nowMinutes < toMinutes(lesson.started_at)
											}
											isPast={
												lesson.date < todayStr ||
												(isToday && nowMinutes >= toMinutes(lesson.started_at))
											}
										/>
									)}
									<LessonCard
										lesson={lesson}
										compact={compact}
										variant={cardVariant}
										isCurrent={isCurrent}
										isPast={isPast}
									/>
								</li>
							);
						})}
						{showCompletionMarker && (
							<li className="relative flex h-8 items-center select-none pointer-events-none">
								<span
									ref={(node) => {
										dotRefs.current[completionDotIndex] = node;
									}}
									className="pointer-events-none absolute left-[16px] top-1/2 h-0 w-0"
									aria-hidden="true"
								/>
								<div
									className="absolute left-[16px] top-1/2 z-10 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border"
									style={{
										background: completionColor,
										borderColor: completionColor,
										boxShadow: `0 0 0 2px var(--color-surface), 0 0 14px ${completionColor}35`,
									}}
								>
									<CheckCircle2 size={12} className="text-white" />
								</div>
								<div className="pl-[36px] flex flex-1 items-center gap-3">
									<span
										className="text-[12px] font-medium"
										style={{ color: completionColor }}
									>
										На этот день всё
									</span>
									<div
										className="flex-1 h-px border-b border-dashed"
										style={{ borderColor: `${completionColor}40` }}
									/>
								</div>
							</li>
						)}
					</ul>
				</div>
				{hiddenCount > 0 ? (
					<div className={isHomeDesktop ? "pl-[36px] pr-2 pt-1" : ""}>
						<div className="rounded-[12px] border border-dashed border-app-border px-3 py-2 text-[12px] font-medium text-app-muted">
							Еще {hiddenCount} пар
						</div>
					</div>
				) : null}
			</div>
		</div>
	);
}
