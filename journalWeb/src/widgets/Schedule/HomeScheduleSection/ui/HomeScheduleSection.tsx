import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useHomeSchedule } from "@/entities/schedule";
import { IconButton, SkeletonCard } from "@/shared/ui";
import { formatDateLong } from "@/shared/utils";
import { LessonList, ScheduleList } from "@/widgets";
import type { LessonCardVariant } from "../../ScheduleList/ui/LessonCard";

export function HomeScheduleSection({
	compact = false,
	cardVariant = "default",
	lessonLimit,
}: {
	compact?: boolean;
	cardVariant?: LessonCardVariant;
	lessonLimit?: number;
} = {}) {
	const {
		offset,
		dateStr,
		title,
		otherLessons,
		otherStatus,
		goPrev,
		goNext,
		goToday,
	} = useHomeSchedule();
	const isHomeDesktop = cardVariant === "homeDesktop";

	return (
		<>
			<div
				className={`${isHomeDesktop ? "mt-0" : "mt-2"} mb-2 flex items-center justify-between`}
			>
				{/* ЛЕВАЯ ЧАСТЬ */}
				<button
					type="button"
					onClick={offset !== 0 ? goToday : undefined}
					disabled={offset === 0}
					className="flex items-center flex-1 text-left min-w-0"
				>
					<div className="w-[2px] self-stretch bg-app-border mr-3 rounded-full md:hidden" />
					<div className="flex flex-col justify-center min-w-0">
						<h2 className="text-[16px] md:text-sm font-bold leading-tight text-app-text line-clamp-2 flex items-center gap-2">
							<CalendarDays size={16} className="text-app-muted shrink-0" />
							<span>{title}</span>
						</h2>
						<p className="text-xs text-app-muted leading-tight mt-0.5 capitalize truncate">
							{formatDateLong(dateStr)}
						</p>
					</div>
				</button>

				{/* ПРАВАЯ ЧАСТЬ */}
				<div className="flex items-center gap-2 ml-3">
					<IconButton
						icon={<ChevronLeft size={18} />}
						onClick={goPrev}
						disabled={offset <= -1}
						size="md"
						shape="square"
						variant="surface"
						aria-label="Предыдущий день"
					/>

					<button
						type="button"
						disabled={offset === 0}
						onClick={goToday}
						className={`h-9 px-3 text-xs font-medium rounded-2xl border transition ${
							offset === 0
								? "border-transparent text-app-muted bg-transparent cursor-default"
								: "border-app-border bg-app-surface hover:bg-app-surface/80 text-app-text"
						}`}
					>
						К сегодня
					</button>

					<IconButton
						icon={<ChevronRight size={18} />}
						onClick={goNext}
						disabled={offset >= 1}
						size="md"
						shape="square"
						variant="surface"
						aria-label="Следующий день"
					/>
				</div>
			</div>

			<div className="flex flex-col flex-1 min-h-0">
				{offset === 0 ? (
					<ScheduleList
						compact={compact}
						cardVariant={cardVariant}
						limit={lessonLimit}
					/>
				) : otherStatus === "loading" && otherLessons.length === 0 ? (
					<div className="flex flex-col gap-3">
						{[0, 1, 2].map((i) => (
							<SkeletonCard key={i} />
						))}
					</div>
				) : otherStatus === "error" && otherLessons.length === 0 ? (
					<p className="text-status-overdue text-sm text-center py-4">
						Ошибка загрузки расписания
					</p>
				) : (
					<LessonList
						lessons={otherLessons}
						forDate={dateStr}
						compact={compact}
						cardVariant={cardVariant}
						limit={lessonLimit}
					/>
				)}
			</div>
		</>
	);
}
