import { BadgeCheck, Crown, Trophy } from "lucide-react";
import { useState } from "react";
import type { LeaderboardScope } from "@/entities/leaderboard";
import { useLeaderboard } from "@/entities/leaderboard";
import { getCachedImageUrl } from "@/shared/lib";
import { Avatar } from "@/shared/ui";
import { PhotoViewerModal } from "@/shared/ui/PhotoViewerModal/PhotoViewerModal";
import { getShortName } from "@/shared/utils/nameUtils";
import { LeaderboardModal } from "./LeaderboardModal";

const RANK_COLORS: Record<number, string> = {
	1: "#FBBF24",
	2: "#CBD5E1",
	3: "#D97706",
};

const RANK_SURFACES: Record<
	number,
	{ badgeBg: string; badgeBorder: string; text: string }
> = {
	1: {
		badgeBg: "rgba(251, 191, 36, 0.14)",
		badgeBorder: "rgba(251, 191, 36, 0.36)",
		text: "#FBBF24",
	},
	2: {
		badgeBg: "rgba(203, 213, 225, 0.12)",
		badgeBorder: "rgba(203, 213, 225, 0.28)",
		text: "#CBD5E1",
	},
	3: {
		badgeBg: "rgba(217, 119, 6, 0.13)",
		badgeBorder: "rgba(217, 119, 6, 0.32)",
		text: "#D97706",
	},
};

const HIGHLIGHT = {
	badgeBg: "var(--color-highlight-badge-bg)",
	badgeBorder: "var(--color-highlight-badge-border)",
	text: "var(--color-highlight-text)",
	coin: "var(--color-highlight-coin)",
};

export function Leaderboard({ myStudentId }: { myStudentId?: number }) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [photoViewerSrc, setPhotoViewerSrc] = useState<string | null>(null);
	const scope: LeaderboardScope = "group";
	const { groupStudents, streamStudents, status, myRankGroup, myRankStream } =
		useLeaderboard();

	const students = scope === "group" ? groupStudents : streamStudents;

	const top3 = students.slice(0, 3);

	// Ensure we have 3 slots even if there are fewer students
	const paddedTop3 = [top3[0] || null, top3[1] || null, top3[2] || null];

	const meIndex = students.findIndex((s) => s.student_id === myStudentId);
	const me = meIndex >= 0 ? students[meIndex] : null;

	const getRankColor = (rank: number) => {
		return RANK_COLORS[rank] ?? "var(--color-text-muted)";
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between mb-4 shrink-0">
				<h3 className="text-app-text text-sm font-bold flex items-center gap-2">
					<Trophy size={16} className="text-app-muted shrink-0" />
					<span>Лидеры группы</span>
				</h3>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setIsModalOpen(true)}
						className="text-xs font-semibold text-app-muted bg-app-surface-strong border border-app-border hover:bg-app-surface-active hover:text-app-text hover:border-app-border-strong active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/30 px-3 py-1.5 rounded-xl transition-all"
					>
						Весь рейтинг
					</button>
				</div>
			</div>

			{status === "loading" ? (
				<div className="space-y-4 animate-pulse">
					<div className="flex justify-between">
						{[1, 2, 3].map((i) => (
							<div key={i} className="flex flex-col items-center gap-2">
								<div className="w-12 h-12 rounded-full bg-app-surface-strong" />
								<div className="w-16 h-3 bg-app-surface-strong rounded" />
							</div>
						))}
					</div>
					<div className="h-14 bg-app-surface-strong rounded-[18px]" />
				</div>
			) : (
				<div className="flex flex-col flex-1">
					{/* TOP 3 */}
					<div className="flex items-start justify-between px-2 mb-6">
						{paddedTop3.map((s, idx) => {
							const rank = s ? s.position : idx + 1;
							const color = getRankColor(rank);
							const rankSurface = RANK_SURFACES[rank];

							if (!s) {
								return (
									<div
										key={`empty-rank-${rank}`}
										className="flex flex-col items-center w-1/3 opacity-0"
									>
										<div className="w-12 h-12" />
									</div>
								);
							}

							return (
								<div
									key={s.student_id}
									className="flex flex-col items-center w-1/3 relative"
								>
									{rank === 1 && (
										<Crown
											size={20}
											className="absolute -top-[18px] text-[#EAB308]"
										/>
									)}
									<div className="relative mt-1">
										<Avatar
											photoUrl={getCachedImageUrl(s.photo_url) || ""}
											fullName={s.full_name}
											size={56}
											className="border-[3px]"
											style={{ borderColor: color }}
											onClick={() =>
												s.photo_url
													? setPhotoViewerSrc(
															getCachedImageUrl(s.photo_url) || s.photo_url,
														)
													: undefined
											}
										/>
										<div
											className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold bg-[#1C1C1E] text-white"
											style={{ border: `1.5px solid ${color}` }}
										>
											{rank}
										</div>
									</div>
									<span className="text-[11px] font-semibold text-app-text mt-3 text-center line-clamp-1 break-all">
										{getShortName(s.full_name)}
									</span>
									<div
										className="mt-1 flex items-center gap-1 rounded-lg border px-2 py-0.5"
										style={{
											background: rankSurface.badgeBg,
											borderColor: rankSurface.badgeBorder,
										}}
									>
										<BadgeCheck size={10} style={{ color: rankSurface.text }} />
										<span
											className="text-[10px] font-bold"
											style={{ color: rankSurface.text }}
										>
											{s.points.toLocaleString()}
										</span>
									</div>
								</div>
							);
						})}
					</div>

					<div className="h-2" />

					{/* ME */}
					{me && (
						<div className="flex items-center gap-3 px-4 py-3 rounded-[16px] bg-[#D97706]/10 border border-[#D97706]/20 mt-auto">
							<div className="w-6 text-center text-[15px] font-bold text-[#D97706]">
								{me.position}
							</div>
							<Avatar
								photoUrl={getCachedImageUrl(me.photo_url) || ""}
								fullName={me.full_name}
								size={40}
								onClick={() =>
									me.photo_url
										? setPhotoViewerSrc(
												getCachedImageUrl(me.photo_url) || me.photo_url,
											)
										: undefined
								}
							/>
							<div className="flex flex-col min-w-0 flex-1">
								<span className="text-[14px] font-medium text-[#D97706] truncate">
									{getShortName(me.full_name)} (Вы)
								</span>
							</div>
							<div
								className="flex items-center gap-1.5 rounded-xl border px-3 py-2 shrink-0"
								style={{
									background: HIGHLIGHT.badgeBg,
									borderColor: HIGHLIGHT.badgeBorder,
								}}
							>
								<BadgeCheck size={14} style={{ color: HIGHLIGHT.coin }} />
								<span
									className="text-[14px] font-bold"
									style={{ color: HIGHLIGHT.text }}
								>
									{me.points.toLocaleString()}
								</span>
							</div>
						</div>
					)}
				</div>
			)}
			<LeaderboardModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				groupStudents={groupStudents}
				streamStudents={streamStudents}
				myStudentId={myStudentId}
				myRankGroup={myRankGroup}
				myRankStream={myRankStream}
			/>

			{photoViewerSrc && (
				<PhotoViewerModal
					src={photoViewerSrc}
					onClose={() => setPhotoViewerSrc(null)}
				/>
			)}
		</div>
	);
}
