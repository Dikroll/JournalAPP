import {
	getGapBetweenLessons,
	getLessonTimeLabel,
	getScheduleTimeInfo,
	useScheduleToday,
} from "@/entities/schedule";
import { toMinutes, useCurrentMinutes } from "@/shared/hooks";
import { InlineImage } from "@/shared/ui";
import { useTimelineMetrics } from "../lib/useTimelineMetrics";
import { CompletionMarker } from "./CompletionMarker";
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

	const {
		timelineRef,
		dotRefs,
		timelineMetrics,
		timelineFillPercent,
		completionColor,
		completionDotIndex,
	} = useTimelineMetrics(
		visibleLessons,
		sorted,
		nowMinutes,
		isHomeDesktop,
		showCompletionMarker,
	);

	if (status === "loading" && today.length === 0) {
		return (
			<div className="flex flex-col gap-3">
				{[0, 1, 2].map((i) => (
					<div
						key={i}
						className="bg-app-surface rounded-3xl h-24 animate-pulse border border-app-border"
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
						<CompletionMarker
							color={completionColor}
							setDotRef={(node) => {
								dotRefs.current[completionDotIndex] = node;
							}}
						/>
					) : null}
				</ul>
			</div>
		</div>
	);
}
