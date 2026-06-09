import { BadgeCheck, Crown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type {
	LeaderboardScope,
	LeaderboardStudent,
	MyRankEntry,
} from "@/entities/leaderboard";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { getCachedImageUrl } from "@/shared/lib";
import { Avatar } from "@/shared/ui";
import { PhotoViewerModal } from "@/shared/ui/PhotoViewerModal/PhotoViewerModal";
import { getShortName } from "@/shared/utils/nameUtils";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	groupStudents: LeaderboardStudent[];
	streamStudents: LeaderboardStudent[];
	myStudentId?: number;
	myRankGroup?: MyRankEntry;
	myRankStream?: MyRankEntry;
}

const RANK_COLORS: Record<number, string> = {
	1: "#FBBF24",
	2: "#CBD5E1",
	3: "#D97706",
};

const RANK_SURFACES: Record<
	number,
	{
		bg: string;
		border: string;
		badgeBg: string;
		badgeBorder: string;
		text: string;
	}
> = {
	1: {
		bg: "linear-gradient(180deg, rgba(251, 191, 36, 0.18), rgba(251, 191, 36, 0.07))",
		border: "rgba(251, 191, 36, 0.42)",
		badgeBg: "rgba(251, 191, 36, 0.14)",
		badgeBorder: "rgba(251, 191, 36, 0.36)",
		text: "#FBBF24",
	},
	2: {
		bg: "linear-gradient(180deg, rgba(203, 213, 225, 0.16), rgba(203, 213, 225, 0.06))",
		border: "rgba(203, 213, 225, 0.34)",
		badgeBg: "rgba(203, 213, 225, 0.12)",
		badgeBorder: "rgba(203, 213, 225, 0.28)",
		text: "#CBD5E1",
	},
	3: {
		bg: "linear-gradient(180deg, rgba(217, 119, 6, 0.18), rgba(217, 119, 6, 0.07))",
		border: "rgba(217, 119, 6, 0.38)",
		badgeBg: "rgba(217, 119, 6, 0.13)",
		badgeBorder: "rgba(217, 119, 6, 0.32)",
		text: "#D97706",
	},
};

const HIGHLIGHT = {
	bg: "var(--color-highlight-bg)",
	border: "var(--color-highlight-border)",
	text: "var(--color-highlight-text)",
	badgeBg: "var(--color-highlight-badge-bg)",
	badgeBorder: "var(--color-highlight-badge-border)",
	coin: "var(--color-highlight-coin)",
	shadow: "var(--color-highlight-shadow)",
};

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

	// For the subtitle: use student.position if user is in the list,
	// otherwise fall back to the API rank for the current scope
	const apiRank = scope === "group" ? myRankGroup : myRankStream;
	const myPosition =
		meIndex >= 0 ? students[meIndex].position : (apiRank?.position ?? null);

	const top3 = students.slice(0, 3);
	const rest = students.slice(3);

	const getRankColor = (rank: number) => {
		return RANK_COLORS[rank] ?? "var(--color-text-muted)";
	};

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 md:p-12 animate-in fade-in duration-200">
			{/* Backdrop */}
			<button
				type="button"
				aria-label="Закрыть рейтинг"
				className="absolute inset-0 bg-black/60 backdrop-blur-sm"
				onClick={onClose}
			/>

			{/* Modal Container */}
			<div
				className="relative w-full max-w-4xl max-h-full flex flex-col border border-app-border rounded-[24px] shadow-2xl overflow-hidden"
				style={{
					background: "var(--color-modal-bg)",
					maxHeight: "calc(100vh - 16px)",
				}}
			>
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-app-border gap-4 shrink-0">
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
						className="absolute top-6 right-6 text-app-muted hover:text-app-text transition-colors"
					>
						<X size={20} />
					</button>
				</div>

				{/* Subtitle */}
				{myPosition != null && (
					<div className="text-center py-4 text-sm text-app-muted shrink-0">
						Ваше место: {myPosition}
					</div>
				)}

				{/* Content Scroll Area */}
				<div
					className="flex-1 overflow-y-auto p-4 sm:p-6"
					style={{ scrollbarWidth: "thin" }}
				>
					{/* TOP 3 */}
					<div className="flex justify-center gap-4 sm:gap-8 mb-8">
						{[
							{ student: top3[1], rank: 2, mt: "mt-8" },
							{ student: top3[0], rank: 1, mt: "mt-0" },
							{ student: top3[2], rank: 3, mt: "mt-12" },
						].map(({ student, rank, mt }) => {
							if (!student)
								return (
									<div key={rank} className={`w-[7.5rem] sm:w-40 ${mt}`} />
								);
							const color = getRankColor(rank);
							const rankSurface = RANK_SURFACES[rank];

							return (
								<div
									key={student.student_id}
									className={`flex flex-col items-center w-[7.5rem] sm:w-40 ${mt} px-4 py-5 rounded-3xl border`}
									style={{
										background: rankSurface.bg,
										borderColor: rankSurface.border,
									}}
								>
									<div className="relative mb-3">
										{rank === 1 && (
											<Crown
												size={24}
												className="absolute -top-7 left-1/2 -translate-x-1/2 text-[#EAB308]"
											/>
										)}
										<Avatar
											photoUrl={getCachedImageUrl(student.photo_url) || ""}
											fullName={student.full_name}
											size={70}
											className="border-[3px]"
											style={{ borderColor: color }}
											onClick={() =>
												student.photo_url
													? setPhotoViewerSrc(
															getCachedImageUrl(student.photo_url) ||
																student.photo_url,
														)
													: undefined
											}
										/>
										<div
											className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#1C1C1E] text-white"
											style={{ border: `2px solid ${color}` }}
										>
											{rank}
										</div>
									</div>
									<span className="text-sm font-semibold text-app-text text-center line-clamp-2 mb-1 leading-tight">
										{getShortName(student.full_name)}
									</span>
									<div
										className="mt-1 flex items-center gap-1 rounded-xl border px-2.5 py-1"
										style={{
											background: rankSurface.badgeBg,
											borderColor: rankSurface.badgeBorder,
										}}
									>
										<BadgeCheck size={12} style={{ color: rankSurface.text }} />
										<span
											className="text-xs font-bold"
											style={{ color: rankSurface.text }}
										>
											{student.points.toLocaleString()}
										</span>
									</div>
								</div>
							);
						})}
					</div>

					{/* REST OF LIST – left column fills first */}
					{(() => {
						const mid = Math.ceil(rest.length / 2);
						const leftCol = rest.slice(0, mid);
						const rightCol = rest.slice(mid);

						const renderStudent = (student: LeaderboardStudent) => {
							const rank = student.position;
							const isMe = student.student_id === myStudentId;

							return (
								<div
									key={student.student_id}
									className="flex items-center gap-3 px-3 py-2 rounded-2xl transition-colors hover:bg-app-surface-strong"
									style={
										isMe
											? {
													background: HIGHLIGHT.bg,
													border: `1px solid ${HIGHLIGHT.border}`,
													boxShadow: HIGHLIGHT.shadow,
												}
											: {
													border: "1px solid transparent",
												}
									}
								>
									<div
										className="w-6 text-center text-sm font-bold shrink-0"
										style={{
											color: isMe ? HIGHLIGHT.text : getRankColor(rank),
										}}
									>
										{rank}
									</div>
									<Avatar
										photoUrl={getCachedImageUrl(student.photo_url) || ""}
										fullName={student.full_name}
										size={32}
										onClick={() =>
											student.photo_url
												? setPhotoViewerSrc(
														getCachedImageUrl(student.photo_url) ||
															student.photo_url,
													)
												: undefined
										}
									/>
									<div className="flex-1 min-w-0 flex items-center gap-1">
										<span
											className="text-sm font-semibold truncate block"
											style={{
												color: isMe ? HIGHLIGHT.text : "var(--color-text)",
											}}
										>
											{getShortName(student.full_name)}
										</span>
										{isMe && (
											<span
												className="text-sm font-semibold shrink-0"
												style={{ color: HIGHLIGHT.text }}
											>
												(Вы)
											</span>
										)}
									</div>
									<div
										className="flex items-center gap-1 rounded-xl px-2.5 py-1.5 shrink-0"
										style={
											isMe
												? {
														background: HIGHLIGHT.badgeBg,
														border: `1px solid ${HIGHLIGHT.badgeBorder}`,
													}
												: {
														background: "var(--color-surface-strong)",
														border: "1px solid var(--color-border)",
													}
										}
									>
										<BadgeCheck
											size={13}
											style={{
												color: isMe ? HIGHLIGHT.coin : "var(--color-comment)",
											}}
										/>
										<span
											className="text-sm font-bold"
											style={{
												color: isMe ? HIGHLIGHT.text : "var(--color-text)",
											}}
										>
											{student.points.toLocaleString()}
										</span>
									</div>
								</div>
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
