import { Clock } from "lucide-react";
import { useScheduleToday } from "@/entities/schedule";
import { getScheduleTimeInfo } from "@/entities/schedule/lib/scheduleTime";
import { formatGapMinutes } from "@/entities/schedule/lib/scheduleGaps";
import { useCurrentMinutes } from "@/shared/hooks";

export function NextClassWidget() {
	const { today, status } = useScheduleToday();
	const nowMinutes = useCurrentMinutes();

	if (status !== "success" || today.length === 0) {
		return (
			<div
				className="rounded-[20px] border border-app-border p-4 flex flex-col min-h-0 relative overflow-hidden"
				style={{
					background: "var(--color-surface)",
					boxShadow: "var(--shadow-card)",
				}}
			>
				<div className="flex items-center justify-between mb-3 shrink-0">
					<h2 className="text-xs font-medium text-app-muted">Следующая пара</h2>
					<div className="w-8 h-8 rounded-xl bg-app-surface-strong flex items-center justify-center">
						<Clock size={16} className="text-app-muted" />
					</div>
				</div>
				<div className="text-app-text font-bold text-lg mb-1">Пар нет</div>
				<div className="text-sm text-app-muted">На сегодня пар нет</div>
			</div>
		);
	}

	const sortedToday = [...today].sort((a, b) => a.lesson - b.lesson);
	const timeInfo = getScheduleTimeInfo(sortedToday, nowMinutes);

	let targetLesson = null;
	let badgeText = "";
	let titleText = "Следующая пара";

	if (timeInfo.type === "in-lesson" && timeInfo.currentLesson) {
		targetLesson = timeInfo.currentLesson;
		badgeText = `ост. ${formatGapMinutes(timeInfo.minutesLeft)}`;
		titleText = "Текущая пара";
	} else if (
		(timeInfo.type === "before-lessons" || timeInfo.type === "in-gap") &&
		timeInfo.nextLesson
	) {
		targetLesson = timeInfo.nextLesson;
		badgeText = `через ${formatGapMinutes(timeInfo.minutesLeft)}`;
		titleText = "Следующая пара";
	}

	if (!targetLesson) {
		return (
			<div
				className="rounded-[20px] border border-app-border p-4 flex flex-col min-h-0 relative overflow-hidden"
				style={{
					background: "var(--color-surface)",
					boxShadow: "var(--shadow-card)",
				}}
			>
				<div className="flex items-center justify-between mb-3 shrink-0">
					<h2 className="text-xs font-medium text-app-muted">Следующая пара</h2>
					<div className="w-8 h-8 rounded-xl bg-app-surface-strong flex items-center justify-center">
						<Clock size={16} className="text-app-muted" />
					</div>
				</div>
				<div className="text-app-text font-bold text-lg mb-1">Пары закончились</div>
				<div className="text-sm text-app-muted">На сегодня пар больше нет</div>
			</div>
		);
	}

	// Trim seconds from time string
	const startTime = targetLesson.started_at.split(':').slice(0, 2).join(':');
	const endTime = targetLesson.finished_at.split(':').slice(0, 2).join(':');

	return (
		<div
			className="rounded-[20px] border border-app-border p-4 flex flex-col min-h-0 relative overflow-hidden"
			style={{
				background: "var(--color-surface)",
				boxShadow: "var(--shadow-card)",
			}}
		>
			<div className="flex items-center justify-between mb-3 shrink-0">
				<h2 className="text-xs font-medium text-app-muted">{titleText}</h2>
				<div className="w-8 h-8 rounded-xl bg-app-surface-strong flex items-center justify-center">
					<Clock size={16} className="text-app-muted" />
				</div>
			</div>

			<div className="text-2xl font-bold text-app-text mb-1">
				{startTime} – {endTime}
			</div>
			
			<div className="text-sm font-semibold text-app-text mb-2 line-clamp-2 leading-snug">
				{targetLesson.subject}
			</div>
			
			<div className="text-xs text-app-muted flex items-center justify-between">
				<span>{targetLesson.room ? `Ауд. ${targetLesson.room}` : ""}</span>
				
				<span className="px-2 py-1 rounded-lg text-[11px] font-medium" style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10B981" }}>
					{badgeText}
				</span>
			</div>
		</div>
	);
}
