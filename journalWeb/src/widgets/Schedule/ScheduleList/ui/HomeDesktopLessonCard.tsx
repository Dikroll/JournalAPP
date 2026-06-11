import { Plus, StickyNote } from "lucide-react";
import type { LessonItem, LessonNote } from "@/entities/schedule";

interface Props {
	lesson: LessonItem;
	isCurrent: boolean;
	timelineDotClass: string;
	timeLabel?: string;
	notes: LessonNote[];
	onOpenNotes: () => void;
}

export function HomeDesktopLessonCard({
	lesson,
	isCurrent,
	timelineDotClass,
	timeLabel,
	notes,
	onOpenNotes,
}: Props) {
	return (
		<div className="relative py-1 pl-[36px] pr-2 flex flex-col justify-center min-h-0">
			<div className="absolute left-[16px] top-[18px] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full z-10 bg-app-surface flex items-center justify-center">
				<div
					className={`w-3 h-3 rounded-full border border-app-border shadow-[0_0_8px_rgba(59,130,246,0.22)] ${timelineDotClass}`}
				/>
			</div>

			<div
				className={`flex flex-col flex-1 rounded-[16px] px-3.5 py-2.5 border transition-all ${
					isCurrent
						? "bg-app-surface-active border-app-border-strong"
						: "bg-app-surface-hover border-app-border"
				}`}
			>
				<div className="flex items-center gap-1.5 text-app-muted mb-1">
					<span className="text-[11px] font-medium">
						{lesson.started_at} – {lesson.finished_at}
					</span>
					{timeLabel && (
						<span className="text-[10px] font-medium text-brand ml-auto">
							{timeLabel}
						</span>
					)}
				</div>

				<p className="line-clamp-2 font-semibold text-app-text leading-snug text-[13px] mb-2">
					{lesson.subject}
				</p>

				<div className="flex items-center gap-2 flex-wrap">
					<span className="text-[11px] text-app-muted">{lesson.room}</span>

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
						className="inline-flex items-center gap-1 border border-dashed border-app-border rounded-lg px-2 py-0.5 text-app-faint hover:text-app-text hover:bg-app-surface-active hover:border-app-border-strong active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/30 transition-all"
					>
						<Plus size={9} />
						<span className="text-[10px]">Заметка</span>
					</button>
				</div>
			</div>
		</div>
	);
}
