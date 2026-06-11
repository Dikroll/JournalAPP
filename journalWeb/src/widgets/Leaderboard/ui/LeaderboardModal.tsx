import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type {
	LeaderboardScope,
	LeaderboardStudent,
	MyRankEntry,
} from "@/entities/leaderboard";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { PhotoViewerModal } from "@/shared/ui/PhotoViewerModal/PhotoViewerModal";
import { LeaderboardRow } from "./LeaderboardRow";
import { TopThreeModalList } from "./TopThreeModalList";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	groupStudents: LeaderboardStudent[];
	streamStudents: LeaderboardStudent[];
	myStudentId?: number;
	myRankGroup?: MyRankEntry;
	myRankStream?: MyRankEntry;
}

export function LeaderboardModal({
	isOpen,
	onClose,
	groupStudents,
	streamStudents,
	myStudentId,
	myRankGroup,
	myRankStream,
}: Props) {
	const isDesktop = useIsDesktop();
	const [scope, setScope] = useState<LeaderboardScope>("group");
	const [photoViewerSrc, setPhotoViewerSrc] = useState<string | null>(null);

	useEffect(() => {
		if (!isOpen || !isDesktop) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, isDesktop, onClose]);

	if (!isOpen) return null;

	const students = scope === "group" ? groupStudents : streamStudents;
	const meIndex = students.findIndex((s) => s.student_id === myStudentId);

	const apiRank = scope === "group" ? myRankGroup : myRankStream;
	const myPosition =
		meIndex >= 0 ? students[meIndex].position : (apiRank?.position ?? null);

	const top3 = students.slice(0, 3);
	const rest = students.slice(3);

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-stretch justify-center p-0 sm:items-center sm:p-6 md:p-12 animate-in fade-in duration-200">
			{/* Backdrop */}
			<button
				type="button"
				aria-label="Закрыть рейтинг"
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal Container */}
			<div
				className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-4xl flex-col overflow-hidden border border-app-border shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-48px)] sm:rounded-3xl"
				style={{
					background: "var(--color-modal-bg)",
				}}
			>
				{/* Header */}
				<div className="flex shrink-0 flex-col justify-between gap-4 border-b border-app-border px-6 pb-5 pt-[max(36px,calc(env(safe-area-inset-top)+20px))] sm:flex-row sm:items-center sm:p-6">
					<h2 className="text-xl font-bold text-app-text">Рейтинг</h2>

					{/* Tabs */}
					<div className="flex gap-6 mx-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2">
						{(["group", "stream"] as LeaderboardScope[]).map((s) => (
							<button
								type="button"
								key={s}
								onClick={() => setScope(s)}
								className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
									scope === s
										? "border-[#EF4444] text-app-text"
										: "border-transparent text-app-muted hover:text-app-text"
								}`}
							>
								{s === "group" ? "Группа" : "Поток"}
							</button>
						))}
					</div>

					<button
						type="button"
						onClick={onClose}
						className="absolute right-6 top-[max(36px,calc(env(safe-area-inset-top)+20px))] text-app-muted transition-colors hover:text-app-text sm:top-6"
					>
						<X size={20} />
					</button>
				</div>

				{/* Subtitle */}
				{myPosition != null && (
					<div className="shrink-0 py-4 text-center text-sm text-app-muted">
						Ваше место: {myPosition}
					</div>
				)}

				{/* Content Scroll Area */}
				<div
					className="min-h-0 flex-1 overflow-y-auto px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-4 sm:p-6"
					style={{ scrollbarWidth: "thin" }}
				>
					<TopThreeModalList
						top3={top3}
						onPhotoClick={(url) => setPhotoViewerSrc(url)}
					/>

					{/* REST OF LIST */}
					{(() => {
						const mid = Math.ceil(rest.length / 2);
						const leftCol = rest.slice(0, mid);
						const rightCol = rest.slice(mid);

						const renderStudent = (student: LeaderboardStudent) => {
							return (
								<LeaderboardRow
									key={student.student_id}
									student={student}
									isMe={student.student_id === myStudentId}
									rank={student.position}
									onPhotoClick={(url) => setPhotoViewerSrc(url)}
								/>
							);
						};

						return (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
								<div className="flex flex-col gap-y-2">
									{leftCol.map((s) => renderStudent(s))}
								</div>
								<div className="flex flex-col gap-y-2">
									{rightCol.map((s) => renderStudent(s))}
								</div>
							</div>
						);
					})()}
				</div>
			</div>

			{photoViewerSrc && (
				<PhotoViewerModal
					src={photoViewerSrc}
					onClose={() => setPhotoViewerSrc(null)}
				/>
			)}
		</div>,
		document.body,
	);
}
