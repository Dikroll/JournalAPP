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
				className={`${
					isHomeDesktop ? "mt-0" : "mt-2"
				} mb-3 flex items-center justify-between`}
			>
				{/* ЛЕВАЯ ЧАСТЬ */}
				<button
					type="button"
					onClick={offset !== 0 ? goToday : undefined}
					disabled={offset === 0}
					className="flex items-center text-left min-w-0 flex-1"
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
				<div
					className={`flex items-center justify-end shrink-0 w-[170px] ${
						isHomeDesktop ? "ml-3" : "ml-2"
					}`}
				>
					<div className="flex items-center">
						<IconButton
							icon={<ChevronLeft size={18} />}
							onClick={goPrev}
							disabled={offset <= -1}
							size="md"
							shape="square"
							variant="surface"
							aria-label="Предыдущий день"
						/>

					<div 
						className={`grid transition-all duration-300 ease-out ${
							offset === 0 
								? "grid-cols-[0fr] opacity-0 mx-1" 
								: "grid-cols-[1fr] opacity-100 mx-2"
						}`}
					>
						<div className="overflow-hidden flex items-center justify-center px-[2px] py-1 -mx-[2px]">
							<button
								type="button"
								onClick={goToday}
								className="h-9 px-3 text-xs font-medium rounded-2xl border border-app-border bg-app-surface hover:bg-app-surface/80 text-app-text whitespace-nowrap active:scale-95 transition-transform"
							>
								К сегодня
							</button>
						</div>
					</div>

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
