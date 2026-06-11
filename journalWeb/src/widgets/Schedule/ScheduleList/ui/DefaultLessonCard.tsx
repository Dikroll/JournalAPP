import { Clock, MapPin, Plus, StickyNote, User } from "lucide-react";
import type { LessonItem, LessonNote } from "@/entities/schedule";

interface Props {
	lesson: LessonItem;
	isCurrent: boolean;
	timeLabel?: string;
	notes: LessonNote[];
	onOpenNotes: () => void;
}

export function DefaultLessonCard({
	lesson,
	isCurrent,
	timeLabel,
	notes,
	onOpenNotes,
}: Props) {
	return (
		<div
			className={`rounded-3xl px-3 border transition-all flex-1 flex flex-col justify-center min-h-0 overflow-hidden py-1.5 ${
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
			<div className="flex items-center gap-3 mb-1">
				<div
					className={`flex-shrink-0 rounded-full flex items-center justify-center border w-8 h-8 ${
						isCurrent
							? "bg-brand-subtle border-brand-border"
							: "bg-app-surface border-app-border"
					}`}
				>
					<span
						className={`font-bold leading-none text-[11px] ${
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

			<div className="flex items-center gap-1.5 text-app-muted mb-0.5 pl-11">
				<Clock size={10} />
				<span className="text-[11px]">
					{lesson.started_at} – {lesson.finished_at}
				</span>
				{timeLabel && (
					<span className="text-[10px] font-medium text-brand ml-auto">
						{timeLabel}
					</span>
				)}
			</div>

			<div className="flex items-center gap-1.5 text-app-muted mb-1 pl-11">
				<User size={10} />
				<span className="text-[10px] truncate">{lesson.teacher}</span>
			</div>

			<div className="flex items-center gap-2 flex-wrap pl-11">
				<div className="inline-flex items-center gap-1 bg-app-surface border border-app-border rounded-lg px-2 py-0.5">
					<MapPin size={9} className="text-app-text flex-shrink-0" />
					<span className="text-[10px] text-app-text">{lesson.room}</span>
				</div>

				{notes.map((note) => (
					<button
						key={note.id}
						type="button"
						onClick={onOpenNotes}
						className="inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 border transition-colors"
						style={{
							background: `${note.status.color}10`,
							borderColor: `${note.status.color}30`,
						}}
					>
						<StickyNote size={9} style={{ color: note.status.color }} />
						<span
							className="text-[10px] font-medium truncate max-w-[120px]"
							style={{ color: note.status.color }}
						>
							{note.text}
						</span>
					</button>
				))}

				<button
					type="button"
					onClick={onOpenNotes}
					className="inline-flex items-center gap-1 border border-dashed border-app-border rounded-lg px-2 py-0.5 text-app-faint hover:text-app-muted transition-colors"
				>
					<Plus size={9} />
					<span className="text-[10px]">Заметка</span>
				</button>
			</div>
		</div>
	);
}
