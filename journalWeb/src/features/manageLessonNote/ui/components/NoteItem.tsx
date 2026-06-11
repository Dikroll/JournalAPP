import { Pencil, Trash2 } from "lucide-react";
import type { LessonNote } from "@/entities/schedule";
import { useLessonNotesStore } from "@/entities/schedule";

interface Props {
	note: LessonNote;
	lessonKey: string;
	onEdit: (n: LessonNote) => void;
}

export function NoteItem({ note, lessonKey, onEdit }: Props) {
	const removeNote = useLessonNotesStore((s) => s.removeNote);

	return (
		<div
			className="flex items-start gap-2 rounded-xl px-3 py-2.5 border"
			style={{
				background: `${note.status.color}08`,
				borderColor: `${note.status.color}20`,
			}}
		>
			<span
				className="text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0 mt-0.5"
				style={{
					background: `${note.status.color}15`,
					color: note.status.color,
				}}
			>
				{note.status.label}
			</span>
			<p className="text-xs text-app-text flex-1 leading-relaxed">
				{note.text}
			</p>
			<div className="flex gap-1 shrink-0">
				<button
					type="button"
					onClick={() => onEdit(note)}
					className="p-1 rounded-md text-app-faint hover:text-app-muted transition-colors"
				>
					<Pencil size={11} />
				</button>
				<button
					type="button"
					onClick={() => removeNote(lessonKey, note.id)}
					className="p-1 rounded-md text-app-faint hover:text-status-overdue transition-colors"
				>
					<Trash2 size={11} />
				</button>
			</div>
		</div>
	);
}
