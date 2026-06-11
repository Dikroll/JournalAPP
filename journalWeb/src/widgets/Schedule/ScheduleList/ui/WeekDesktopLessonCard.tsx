import { Clock, MapPin, Plus, StickyNote, User } from "lucide-react";
import type { LessonItem, LessonNote } from "@/entities/schedule";

interface Props {
	lesson: LessonItem;
	isCurrent: boolean;
	timeLabel?: string;
	notes: LessonNote[];
	onOpenNotes: () => void;
}

export function WeekDesktopLessonCard({
	lesson,
	isCurrent,
	timeLabel,
	notes,
	onOpenNotes,
}: Props) {
	return (
		<div
			className={`relative rounded-3xl px-3.5 py-3 border transition-all flex-1 min-h-0 overflow-hidden ${
				isCurrent
					? "bg-app-surface-active border-app-border-strong"
					: "bg-app-surface border-app-border"
			}`}
			style={{
				boxShadow: isCurrent
					? "var(--shadow-card)"
					: "0 2px 12px 0 rgba(0,0,0,0.2)",
				backdropFilter: "blur(16px)",
			}}
		>
			<div
				className={`pointer-events-none absolute right-3 top-3 z-10 hidden h-7 w-7 items-center justify-center rounded-full border md:flex ${
					isCurrent
						? "bg-brand-subtle border-brand-border text-brand"
						: "bg-app-surface border-app-border text-app-muted"
				}`}
			>
				<span className="text-[14px] font-bold leading-none [font-variant-numeric:tabular-nums]">
					{lesson.lesson}
				</span>
			</div>

			<div className="flex items-center gap-3 mb-1 md:hidden">
				<div
					className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${
						isCurrent
							? "bg-brand-subtle border-brand-border"
							: "bg-app-surface border-app-border"
					}`}
				>
					<span
						className={`text-[11px] font-bold leading-none ${
							isCurrent ? "text-brand" : "text-app-muted"
						}`}
					>
						{lesson.lesson}
					</span>
				</div>
				<p className="line-clamp-3 flex-1 font-semibold text-app-text leading-snug text-[13px]">
					{lesson.subject}
				</p>
			</div>

			<div className="hidden md:flex items-center gap-1.5 text-app-muted mb-1.5 pr-11">
				<Clock size={11} />
				<span className="text-[12px] whitespace-nowrap">
					{lesson.started_at}–{lesson.finished_at}
				</span>
			</div>

			<p className="hidden font-semibold text-app-text leading-[1.22] text-[13px] pr-7 md:line-clamp-4">
				{lesson.subject}
			</p>

			<div className="flex items-center gap-1.5 text-app-muted mb-0.5 pl-11 md:pl-0 md:mb-1.5">
				<Clock size={10} className="md:hidden" />
				<span className="text-[11px] md:hidden">
					{lesson.started_at} – {lesson.finished_at}
				</span>
				{timeLabel && (
					<span className="text-[10px] font-medium text-brand ml-auto md:hidden">
						{timeLabel}
					</span>
				)}
				<User size={11} className="hidden md:block" />
				<span className="hidden truncate text-[11px] md:block">
					{lesson.teacher}
				</span>
			</div>

			<div className="flex items-center gap-1.5 text-app-muted mb-1 pl-11 md:hidden">
				<User size={10} />
				<span className="text-[10px] truncate">{lesson.teacher}</span>
			</div>

			<div className="flex items-center gap-2 flex-wrap pl-11 md:pl-0">
				<div className="inline-flex items-center gap-1 bg-app-surface border border-app-border rounded-lg px-2 py-1">
					<MapPin size={10} className="text-app-text flex-shrink-0" />
					<span className="text-[11px] text-app-text">{lesson.room}</span>
				</div>

				{notes.map((note) => (
					<button
						key={note.id}
						type="button"
						onClick={onOpenNotes}
						className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 border transition-colors"
						style={{
							background: `${note.status.color}10`,
							borderColor: `${note.status.color}30`,
						}}
					>
						<StickyNote size={10} style={{ color: note.status.color }} />
						<span
							className="text-[11px] font-medium truncate max-w-[120px]"
							style={{ color: note.status.color }}
						>
							{note.text}
						</span>
					</button>
				))}

				<button
					type="button"
					onClick={onOpenNotes}
					className="inline-flex items-center gap-1 border border-dashed border-app-border rounded-lg px-2 py-1 text-app-faint hover:text-app-muted transition-colors"
				>
					<Plus size={10} />
					<span className="text-[11px]">Заметка</span>
				</button>
			</div>
		</div>
	);
}
