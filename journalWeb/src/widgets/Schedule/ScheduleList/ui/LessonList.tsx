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
}

export function LessonList({
	lessons,
	forDate,
	compact = false,
	cardVariant = "default",
}: Props) {
	const nowMinutes = useCurrentMinutes();
	const todayStr = getTodayString();
	const isToday = !forDate || forDate === todayStr;
	const emptyText = isToday ? "Пар сегодня нет" : "Пар на этот день нет";

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

	const sorted = [...lessons].sort((a, b) => a.lesson - b.lesson);
	const isHomeDesktop = cardVariant === "homeDesktop";
	const activeTimelineDots = sorted.filter((lesson) => {
		if (lesson.date < todayStr) return true;
		if (lesson.date > todayStr) return false;
		return nowMinutes >= toMinutes(lesson.started_at);
	}).length;
	const timelineFillPercent =
		sorted.length <= 1
			? activeTimelineDots > 0
				? 100
				: 0
			: Math.max(
					0,
					Math.min(100, ((activeTimelineDots - 1) / (sorted.length - 1)) * 100),
				);

	return (
		<div className="relative">
			{isHomeDesktop && (
				<div
					className="absolute left-[16px] top-[18px] bottom-[18px] w-[2px] -translate-x-1/2 rounded-full z-0"
					style={{
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
				{sorted.map((lesson, i) => {
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
							className="flex flex-col"
						>
							{i > 0 && (
								<GapIndicator
									gap={getGapBetweenLessons(sorted[i - 1], lesson)}
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
			</ul>
		</div>
	);
}
