import { useCallback, useState } from "react";
import type { LessonItem } from "@/entities/schedule";
import {
	getNotesForKey,
	makeLessonKey,
	useLessonNotesStore,
} from "@/entities/schedule";
import { LessonNoteSheet } from "@/features/manageLessonNote";
import { CompactLessonCard } from "./CompactLessonCard";
import { DefaultLessonCard } from "./DefaultLessonCard";
import { HomeDesktopLessonCard } from "./HomeDesktopLessonCard";
import { WeekDesktopLessonCard } from "./WeekDesktopLessonCard";

export type LessonCardVariant = "default" | "homeDesktop" | "weekDesktop";

interface Props {
	lesson: LessonItem;
	isCurrent?: boolean;
	isPast?: boolean;
	timeLabel?: string;
	compact?: boolean;
	variant?: LessonCardVariant;
}

export function LessonCard({
	lesson,
	isCurrent = false,
	isPast = false,
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
	const timelineDotClass = isCurrent
		? "bg-[#EF4444]"
		: isPast
			? "bg-[#3B82F6]"
			: "bg-[#64748B]";

	const handleOpenNotes = useCallback(() => setShowSheet(true), []);

	return (
		<>
			{compact ? (
				<CompactLessonCard
					lesson={lesson}
					isCurrent={isCurrent}
					timeLabel={timeLabel}
				/>
			) : isWeekDesktop ? (
				<WeekDesktopLessonCard
					lesson={lesson}
					isCurrent={isCurrent}
					timeLabel={timeLabel}
					notes={notes}
					onOpenNotes={handleOpenNotes}
				/>
			) : isHomeDesktop ? (
				<HomeDesktopLessonCard
					lesson={lesson}
					isCurrent={isCurrent}
					timelineDotClass={timelineDotClass}
					timeLabel={timeLabel}
					notes={notes}
					onOpenNotes={handleOpenNotes}
				/>
			) : (
				<DefaultLessonCard
					lesson={lesson}
					isCurrent={isCurrent}
					timeLabel={timeLabel}
					notes={notes}
					onOpenNotes={handleOpenNotes}
				/>
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
