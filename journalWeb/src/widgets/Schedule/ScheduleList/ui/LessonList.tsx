import type { LessonItem } from "@/entities/schedule";
import { getGapBetweenLessons } from "@/entities/schedule/lib/scheduleGaps";
import { toMinutes, useCurrentMinutes } from "@/shared/hooks";
import { InlineImage } from "@/shared/ui";
import { getTodayString } from "@/shared/utils";
import { useTimelineMetrics } from "../lib/useTimelineMetrics";
import { CompletionMarker } from "./CompletionMarker";
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
							<CompletionMarker
								color={completionColor}
								setDotRef={(node) => {
									dotRefs.current[completionDotIndex] = node;
								}}
							/>
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
