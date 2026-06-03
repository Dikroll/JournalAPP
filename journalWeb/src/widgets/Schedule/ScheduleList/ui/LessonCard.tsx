import { Clock, MapPin, Plus, StickyNote, User } from "lucide-react";
import { useCallback, useState } from "react";
import type { LessonItem } from "@/entities/schedule";
import {
	getNotesForKey,
	makeLessonKey,
	useLessonNotesStore,
} from "@/entities/schedule";
import { LessonNoteSheet } from "@/features/manageLessonNote";

export type LessonCardVariant = "default" | "homeDesktop" | "weekDesktop";

interface Props {
	lesson: LessonItem;
	isCurrent?: boolean;
	timeLabel?: string;
	compact?: boolean;
	variant?: LessonCardVariant;
}

export function LessonCard({
	lesson,
	isCurrent = false,
	timeLabel,
	compact = false,
	variant = "default",
}: Props) {
	const [showSheet, setShowSheet] = useState(false);
	const lessonKey = makeLessonKey(lesson.date, lesson.lesson);
	const notes = useLessonNotesStore(
		useCallback((s) => getNotesForKey(s.notes, lessonKey), [lessonKey]),
	);
	const isHomeDesktop = variant === "homeDesktop";
	const isWeekDesktop = variant === "weekDesktop";

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
			) : isWeekDesktop ? (
				<div
					className={`relative rounded-[20px] px-3.5 py-3 border transition-all flex-1 min-h-0 overflow-hidden ${
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
								onClick={() => setShowSheet(true)}
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
							onClick={() => setShowSheet(true)}
							className="inline-flex items-center gap-1 border border-dashed border-app-border rounded-lg px-2 py-1 text-app-faint hover:text-app-muted transition-colors"
						>
							<Plus size={10} />
							<span className="text-[11px]">Заметка</span>
						</button>
					</div>
				</div>
			) : (
				/* ── Полная карточка (мобайл / другой день) ── */
				<div
					className={`rounded-[20px] px-3 border transition-all flex-1 flex flex-col justify-center min-h-0 overflow-hidden ${isHomeDesktop ? "py-3" : "py-1.5"} ${
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
					<div className={`flex items-center gap-3 ${isHomeDesktop ? "mb-2" : "mb-1"}`}>
						<div
							className={`flex-shrink-0 rounded-full flex items-center justify-center border ${isHomeDesktop ? "w-10 h-10" : "w-8 h-8"} ${
								isCurrent
									? "bg-brand-subtle border-brand-border"
									: "bg-app-surface border-app-border"
							}`}
						>
							<span
								className={`font-bold leading-none ${isHomeDesktop ? "text-[13px]" : "text-[11px]"} ${
									isCurrent ? "text-brand" : "text-app-muted"
								}`}
							>
								{lesson.lesson}
							</span>
						</div>
						<p className={`line-clamp-3 flex-1 font-semibold text-app-text leading-snug ${isHomeDesktop ? "text-[16px]" : "text-[13px]"}`}>
							{lesson.subject}
						</p>
					</div>

					<div className={`flex items-center gap-1.5 text-app-muted mb-0.5 ${isHomeDesktop ? "pl-[52px]" : "pl-11"}`}>
						<Clock size={isHomeDesktop ? 13 : 10} />
						<span className={isHomeDesktop ? "text-[13px]" : "text-[11px]"}>
							{lesson.started_at} – {lesson.finished_at}
						</span>
						{timeLabel && (
							<span className={`${isHomeDesktop ? "text-[12px]" : "text-[10px]"} font-medium text-brand ml-auto`}>
								{timeLabel}
							</span>
						)}
					</div>

					<div className={`flex items-center gap-1.5 text-app-muted mb-1 ${isHomeDesktop ? "pl-[52px]" : "pl-11"}`}>
						<User size={isHomeDesktop ? 13 : 10} />
						<span className={`${isHomeDesktop ? "text-[13px]" : "text-[10px]"} truncate`}>{lesson.teacher}</span>
					</div>

					<div className={`flex items-center gap-2 flex-wrap ${isHomeDesktop ? "pl-[52px]" : "pl-11"}`}>
						<div className={`inline-flex items-center gap-1 bg-app-surface border border-app-border rounded-lg px-2 ${isHomeDesktop ? "py-1" : "py-0.5"}`}>
							<MapPin size={isHomeDesktop ? 11 : 9} className="text-app-text flex-shrink-0" />
							<span className={`${isHomeDesktop ? "text-[12px]" : "text-[10px]"} text-app-text`}>{lesson.room}</span>
						</div>

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
