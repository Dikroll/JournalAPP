import { Clock, GraduationCap, MapPin } from "lucide-react";
import type { LessonItem } from "@/entities/schedule";
import { isPastLesson } from "../lib/displayDaysFormatter";

export function PendingLessonRow({ lesson }: { lesson: LessonItem }) {
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
