import { Clock, MapPin } from "lucide-react";
import type { LessonItem } from "@/entities/schedule";

interface Props {
	lesson: LessonItem;
	isCurrent: boolean;
	timeLabel?: string;
}

export function CompactLessonCard({ lesson, isCurrent, timeLabel }: Props) {
	return (
		<div
			className={`rounded-[14px] px-3 py-2 border transition-all flex items-center gap-3 min-w-0 flex-1 ${
				isCurrent
					? "bg-app-surface-active border-app-border-strong"
					: "bg-app-surface border-app-border"
			}`}
			style={{ boxShadow: "0 2px 8px 0 rgba(0,0,0,0.15)" }}
		>
			<div
				className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold ${
					isCurrent
						? "bg-brand-subtle border-brand-border text-brand"
						: "bg-app-surface border-app-border text-app-muted"
				}`}
			>
				{lesson.lesson}
			</div>
			<p className="flex-1 font-semibold text-app-text text-[11px] leading-tight truncate">
				{lesson.subject}
			</p>
			<div className="flex items-center gap-1 text-app-muted flex-shrink-0">
				<Clock size={8} />
				<span className="text-[9px]">
					{lesson.started_at}–{lesson.finished_at}
				</span>
			</div>
			<div className="inline-flex items-center gap-1 bg-app-bg border border-app-border rounded-md px-1.5 py-0.5 flex-shrink-0">
				<MapPin size={8} className="text-app-muted flex-shrink-0" />
				<span className="text-[10px] text-app-muted">{lesson.room}</span>
			</div>
			{timeLabel && (
				<span className="text-[10px] font-medium text-brand flex-shrink-0">
					{timeLabel}
				</span>
			)}
		</div>
	);
}
