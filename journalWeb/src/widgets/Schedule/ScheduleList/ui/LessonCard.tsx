import { Clock, MapPin, Plus, StickyNote, User } from "lucide-react";
import { useCallback, useState } from "react";
import type { LessonItem } from "@/entities/schedule";
import {
	getNotesForKey,
	makeLessonKey,
	useLessonNotesStore,
} from "@/entities/schedule";
import { LessonNoteSheet } from "@/features/manageLessonNote";
import { getShortName } from "@/shared/utils";

interface Props {
	lesson: LessonItem;
	isCurrent?: boolean;
	timeLabel?: string;
	compact?: boolean;
}

export function LessonCard({
	lesson,
	isCurrent = false,
	timeLabel,
	compact = false,
}: Props) {
	const [showSheet, setShowSheet] = useState(false);
	const lessonKey = makeLessonKey(lesson.date, lesson.lesson);
	const notes = useLessonNotesStore(
		useCallback((s) => getNotesForKey(s.notes, lessonKey), [lessonKey]),
	);
	const teacherName = getShortName(lesson.teacher);

	return (
		<>
			{compact ? (
				/* ── Компактная строка (десктоп, много пар) ── */
				<div
					className={`rounded-[14px] px-3 py-2 border transition-all flex items-center gap-3 min-w-0 flex-1 ${
						isCurrent
							? "bg-app-surface-active border-app-border-strong"
							: "bg-app-surface border-app-border"
					}`}
					style={{ boxShadow: "0 2px 8px 0 rgba(0,0,0,0.15)" }}
				>
					{/* Номер пары */}
					<div
						className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold ${
							isCurrent
								? "bg-brand-subtle border-brand-border text-brand"
								: "bg-app-surface border-app-border text-app-muted"
						}`}
					>
						{lesson.lesson}
					</div>
					{/* Название */}
					<p className="flex-1 font-semibold text-app-text text-[11px] leading-tight truncate">
						{lesson.subject}
					</p>
					{/* Время */}
					<div className="flex items-center gap-1 text-app-muted flex-shrink-0">
						<Clock size={8} />
						<span className="text-[9px]">
							{lesson.started_at}–{lesson.finished_at}
						</span>
					</div>
					{/* Аудитория */}
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
			) : (
				/* ── Полная карточка (мобайл / другой день) ── */
				<div
					className={`relative overflow-hidden rounded-[20px] px-3 py-2 border transition-all flex-1 flex flex-col justify-center min-h-0 ${
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
						className={`absolute left-0 top-0 z-10 h-10 w-10 ${
							isCurrent ? "text-red-400" : "text-app-muted"
						}`}
					>
						<svg
							className="absolute left-0 top-0 h-9 w-9"
							viewBox="0 0 36 36"
							aria-hidden="true"
						>
							<path
								d="M34 1H18C8.6 1 1 8.6 1 18V34"
								fill="none"
								stroke="currentColor"
								strokeLinecap="round"
								strokeWidth="2.25"
								opacity={isCurrent ? 0.85 : 0.65}
							/>
						</svg>
						<span className="absolute left-3.5 top-4 text-[15px] font-bold leading-none [font-variant-numeric:tabular-nums]">
							{lesson.lesson}
						</span>
					</div>

					<div className="ml-auto mr-1 flex w-fit min-w-[132px] max-w-full items-center justify-center gap-1.5 rounded-xl border border-app-border bg-app-bg/35 px-2 py-1 text-app-muted mb-1.5">
						<Clock size={10} className="shrink-0" />
						<span className="text-[11px] whitespace-nowrap">
							{lesson.started_at}–{lesson.finished_at}
						</span>
					</div>

					<p className="line-clamp-3 font-semibold text-app-text leading-snug text-[13px] mb-1">
						{lesson.subject}
					</p>

					<div className="flex items-center gap-1.5 text-app-muted mb-1 min-w-0">
						<User size={10} />
						<span className="text-[10px] truncate">{teacherName}</span>
					</div>

					<div className="flex items-center gap-2 flex-wrap">
						<div className="inline-flex items-center gap-1 bg-app-surface border border-app-border rounded-lg px-2 py-0.5">
							<MapPin size={9} className="text-app-text flex-shrink-0" />
							<span className="text-[10px] text-app-text">{lesson.room}</span>
						</div>

						{timeLabel && (
							<span className="inline-flex items-center rounded-lg border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
								{timeLabel}
							</span>
						)}

						{notes.map((note) => (
							<button
								key={note.id}
								type="button"
								onClick={() => setShowSheet(true)}
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
							onClick={() => setShowSheet(true)}
							className="inline-flex items-center gap-1 border border-dashed border-app-border rounded-lg px-2 py-0.5 text-app-faint hover:text-app-muted transition-colors"
						>
							<Plus size={9} />
							<span className="text-[10px]">Заметка</span>
						</button>
					</div>
				</div>
			)}

			{showSheet && (
				<LessonNoteSheet
					date={lesson.date}
					lessonNumber={lesson.lesson}
					subjectName={lesson.subject}
					onClose={() => setShowSheet(false)}
				/>
			)}
		</>
	);
}
