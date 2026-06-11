import {
	Download,
	ExternalLink,
	MessageSquare,
	OctagonAlert,
	Trash2,
	Upload,
} from "lucide-react";
import { useState } from "react";
import type { HomeworkStatus } from "@/entities/homework";
import { useDeleteHomework } from "@/features/deleteHomework";
import {
	StudAnswerSheet,
	useDownloadHomework,
} from "@/features/downloadHomework";
import { SendHomeworkSheet } from "@/features/sendHomework";

interface Props {
	homeworkId: number;
	homeworkTheme: string;
	statusKey: HomeworkStatus;
	fileUrl: string | null;
	studAnswer: string | null;
	studFileUrl: string | null;
	studId: number | null;
	isExpired?: boolean;
}

export function HomeworkCardActions({
	homeworkId,
	homeworkTheme,
	statusKey,
	fileUrl,
	studAnswer,
	studFileUrl,
	studId,
	isExpired = false,
}: Props) {
	const [sheetOpen, setSheetOpen] = useState(false);
	const [showDeleteWarning, setShowDeleteWarning] = useState(false);

	const { deleteHomework, isDeleting } = useDeleteHomework(studId, homeworkId);
	const { downloadTask, viewAnswer, answerText, closeAnswerSheet } =
		useDownloadHomework();

	const isChecked = statusKey === "checked";
	const isReturned = statusKey === "returned";
	const isPending = statusKey === "pending";
	const showThreeButtons = isPending || isChecked;

	const studAnswerIsUrl = !!studAnswer?.startsWith("http");
	const studResultUrl = studFileUrl ?? (studAnswerIsUrl ? studAnswer : null);
	const hasAnswer = !!(studResultUrl || studAnswer);

	const handleDelete = () => {
		deleteHomework(() => setShowDeleteWarning(false));
	};

	const DownloadTaskBtn = (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				downloadTask(fileUrl);
			}}
			disabled={!fileUrl}
			title="Скачать задание"
			className="min-w-0 flex items-center justify-center gap-1.5 rounded-2xl border border-app-border bg-app-surface px-3 py-2.5 text-xs text-app-muted hover:bg-app-surface-hover hover:text-app-text disabled:cursor-not-allowed disabled:opacity-30"
		>
			<Download size={14} />
			<span className="truncate">Задание</span>
		</button>
	);

	const ViewAnswerBtn = (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				viewAnswer(studAnswer, studFileUrl);
			}}
			disabled={!hasAnswer}
			title="Мой ответ"
			className="min-w-0 flex items-center justify-center gap-1.5 rounded-2xl border border-app-border bg-app-surface px-3 py-2.5 text-xs text-app-muted hover:bg-app-surface-hover hover:text-app-text disabled:cursor-not-allowed disabled:opacity-30"
		>
			{!studAnswerIsUrl && !studFileUrl ? (
				<MessageSquare size={14} />
			) : (
				<ExternalLink size={14} />
			)}
			<span className="truncate">Ответ</span>
		</button>
	);

	const UploadBtn = ({ label, red }: { label: string; red?: boolean }) => (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				setSheetOpen(true);
			}}
			className={`flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-xs font-medium ${
				red
					? "bg-overdue-bg hover:bg-overdue-border text-status-overdue border border-overdue-border"
					: "bg-app-surface-strong hover:bg-app-surface-active text-app-text border border-app-border-strong"
			}`}
		>
			<Upload size={14} />
			<span className="truncate">{label}</span>
		</button>
	);

	const ExpiredBadge = (
		<div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-overdue-border bg-overdue-bg px-3 py-2.5 text-xs">
			<OctagonAlert size={14} className="text-status-overdue shrink-0" />
			<span className="min-w-0 text-status-overdue">
				Срок сдачи истёк более 6 месяцев назад
			</span>
		</div>
	);

	const DeleteBtn = (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault();
				setShowDeleteWarning(true);
			}}
			disabled={!studId}
			title="Удалить сданное ДЗ"
			className="flex shrink-0 items-center justify-center rounded-2xl border border-app-border bg-app-surface px-3 py-2.5 text-app-muted hover:border-overdue-border hover:bg-overdue-bg hover:text-status-overdue disabled:cursor-not-allowed disabled:opacity-30"
		>
			<Trash2 size={14} />
		</button>
	);

	return (
		<>
			<div className="flex flex-wrap items-center gap-2">
				{showThreeButtons ? (
					<>
						<div className="flex min-w-[180px] flex-1 gap-2">
							{DownloadTaskBtn}
							{ViewAnswerBtn}
						</div>
						{DeleteBtn}
					</>
				) : isExpired ? (
					<>
						{ExpiredBadge}
						{DownloadTaskBtn}
					</>
				) : isReturned ? (
					<>
						<UploadBtn label="Загрузить заново" red />
						{DownloadTaskBtn}
					</>
				) : (
					<>
						<UploadBtn label="Загрузить" />
						{DownloadTaskBtn}
					</>
				)}
			</div>

			{showDeleteWarning && (
				<div className="mt-3 p-3 bg-overdue-bg border border-overdue-border rounded-2xl">
					<p className="text-sm text-app-text mb-3">
						Удалить сданное задание? Это действие нельзя отменить.
					</p>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								setShowDeleteWarning(false);
							}}
							disabled={isDeleting}
							className="flex-1 px-4 py-2 bg-app-surface hover:bg-app-surface-hover rounded-xl text-app-text text-sm"
						>
							Отмена
						</button>
						<button
							type="button"
							onClick={(e) => {
								e.preventDefault();
								handleDelete();
							}}
							disabled={isDeleting}
							className="flex-1 px-4 py-2 bg-status-overdue hover:opacity-90 rounded-xl text-white text-sm font-medium disabled:opacity-50"
						>
							{isDeleting ? "Удаляем..." : "Удалить"}
						</button>
					</div>
				</div>
			)}

			{answerText && (
				<StudAnswerSheet
					answer={answerText}
					homeworkTheme={homeworkTheme}
					onClose={closeAnswerSheet}
				/>
			)}

			{sheetOpen && (
				<SendHomeworkSheet
					homeworkId={homeworkId}
					studId={studId}
					homeworkTheme={homeworkTheme}
					onClose={() => setSheetOpen(false)}
				/>
			)}
		</>
	);
}
