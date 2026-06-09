import { CheckCircle2 } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import {
	getGapBetweenLessons,
	getLessonTimeLabel,
	getScheduleTimeInfo,
	useScheduleToday,
} from "@/entities/schedule";
import { toMinutes, useCurrentMinutes } from "@/shared/hooks";
import { InlineImage } from "@/shared/ui";
import { GapIndicator } from "./GapIndicator";
import type { LessonCardVariant } from "./LessonCard";
import { LessonCard } from "./LessonCard";

export function ScheduleList({
	compact = false,
	cardVariant = "default",
	limit,
}: {
	compact?: boolean;
	cardVariant?: LessonCardVariant;
	limit?: number;
}) {
	const { today, status, error } = useScheduleToday();
	const nowMinutes = useCurrentMinutes();
	const sorted = [...today].sort((a, b) => a.lesson - b.lesson);
	const visibleLessons = limit ? sorted.slice(0, limit) : sorted;
	const hiddenCount = sorted.length - visibleLessons.length;
	const timeInfo = getScheduleTimeInfo(sorted, nowMinutes);
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
	const activeTimelineDots = sorted.filter(
		(lesson) =>
			nowMinutes >= toMinutes(lesson.started_at) &&
			nowMinutes <= toMinutes(lesson.finished_at),
	).length
		? sorted.findIndex(
				(lesson) =>
					nowMinutes >= toMinutes(lesson.started_at) &&
					nowMinutes <= toMinutes(lesson.finished_at),
			) + 1
		: sorted.filter((lesson) => nowMinutes > toMinutes(lesson.finished_at))
				.length;
	const isCompletionActive = lastVisibleLesson
		? nowMinutes > toMinutes(lastVisibleLesson.finished_at)
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

	if (status === "loading" && today.length === 0) {
		return (
			<div className="flex flex-col gap-3">
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className="bg-app-surface rounded-[20px] h-24 animate-pulse border border-app-border"
					/>
				))}
			</div>
		);
	}

	if (status === "error" && today.length === 0) {
		return (
			<div className="flex flex-col items-center gap-3 py-4">
				<p className="text-status-overdue text-sm text-center">
					{error ?? "Ошибка загрузки расписания"}
				</p>
			</div>
		);
	}

	if (today.length === 0 && status === "success") {
		return (
			<div className="flex flex-col items-center gap-3 py-4">
				<InlineImage
					src="/homework.svg"
					alt="Нет пар"
					width={300}
					height={300}
				/>
				<p className="text-app-muted text-sm text-center">Пар сегодня нет</p>
			</div>
		);
	}

	if (today.length === 0) return null;

	return (
		<div
			className={`relative flex flex-col min-h-0 w-full ${isHomeDesktop ? "self-start" : "flex-1"}`}
		>
			<div ref={timelineRef} className="relative">
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
					className={`flex flex-col min-h-0 flex-1 ${isHomeDesktop ? "gap-0" : compact ? "gap-1.5" : "gap-3"}`}
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
											previousGap ?? getGapBetweenLessons(sorted[i - 1], lesson)
										}
										compact={compact}
										variant={cardVariant}
										isActive={
											nowMinutes > toMinutes(sorted[i - 1].finished_at) &&
											nowMinutes < toMinutes(lesson.started_at)
										}
										isPast={nowMinutes >= toMinutes(lesson.started_at)}
									/>
								)}
								<LessonCard
									lesson={lesson}
									compact={compact}
									variant={cardVariant}
									isCurrent={
										nowMinutes >= toMinutes(lesson.started_at) &&
										nowMinutes <= toMinutes(lesson.finished_at)
									}
									isPast={nowMinutes > toMinutes(lesson.finished_at)}
									timeLabel={getLessonTimeLabel(timeInfo, lesson)}
								/>
							</li>
						);
					})}
					{hiddenCount > 0 ? (
						<li className="pl-[36px] pr-2 pt-1">
							<div className="rounded-[12px] border border-dashed border-app-border px-3 py-2 text-[12px] font-medium text-app-muted">
								Еще {hiddenCount} пар
							</div>
						</li>
					) : showCompletionMarker ? (
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
									На сегодня всё
								</span>
								<div
									className="flex-1 h-px border-b border-dashed"
									style={{ borderColor: `${completionColor}40` }}
								/>
							</div>
						</li>
					) : null}
				</ul>
			</div>
		</div>
	);
}
