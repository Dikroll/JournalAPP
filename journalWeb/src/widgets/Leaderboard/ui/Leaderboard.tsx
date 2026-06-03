import { Crown, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { LeaderboardScope } from "@/entities/leaderboard";
import { useLeaderboard } from "@/entities/leaderboard";
import { useUser } from "@/entities/user";
import { getCachedImageUrl } from "@/shared/lib";
import { getShortName } from "@/shared/utils/nameUtils";
import { LeaderboardModal } from "./LeaderboardModal";
import { Avatar } from "@/shared/ui";
export function Leaderboard({ myStudentId }: { myStudentId?: number }) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [scope, setScope] = useState<LeaderboardScope>("group");
	const { groupStudents, streamStudents, status } = useLeaderboard();
	const user = useUser();

	const students = scope === "group" ? groupStudents : streamStudents;
	
	const top3 = students.slice(0, 3);
	
	// Ensure we have 3 slots even if there are fewer students
	const paddedTop3 = [
		top3[0] || null,
		top3[1] || null,
		top3[2] || null,
	];

	const meIndex = students.findIndex(s => s.student_id === myStudentId);
	const me = meIndex >= 0 ? students[meIndex] : null;

	const getRankColor = (rank: number) => {
		if (rank === 1) return "#EAB308"; // Gold
		if (rank === 2) return "#9CA3AF"; // Silver
		if (rank === 3) return "#D97706"; // Bronze
		return "var(--color-text-muted)";
	};

	return (
		<div className="flex flex-col h-full">
			<div className="flex items-center justify-between mb-4 shrink-0">
				<h3 className="text-app-text text-sm font-bold flex items-center gap-2">
					Лидеры группы
				</h3>
				<div className="flex items-center gap-2">
					<button
						onClick={() => setIsModalOpen(true)}
						className="text-xs font-medium text-app-muted bg-app-surface-strong hover:bg-app-border px-3 py-1.5 rounded-xl transition-colors"
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
							const rank = idx + 1;
							const color = getRankColor(rank);
							
							if (!s) {
								return (
									<div key={idx} className="flex flex-col items-center w-1/3 opacity-0">
										<div className="w-12 h-12" />
									</div>
								);
							}
							
							return (
								<div key={s.student_id} className="flex flex-col items-center w-1/3 relative">
									{rank === 1 && (
										<Crown size={16} className="absolute -top-5 text-[#EAB308]" />
									)}
									<div className="relative">
										<Avatar 
											photoUrl={getCachedImageUrl(s.photo_url) || ""} 
											fullName={s.full_name} 
											size={48} 
											className="border-2"
											style={{ borderColor: color }}
										/>
										<div 
											className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-[#1C1C1E] text-white"
											style={{ border: `1px solid ${color}` }}
										>
											{rank}
										</div>
									</div>
									<span className="text-[11px] font-semibold text-app-text mt-3 text-center line-clamp-1 break-all">
										{getShortName(s.full_name)}
									</span>
									<span className="text-[10px] text-app-muted mt-0.5">
										{s.points}
									</span>
								</div>
							);
						})}
					</div>

					<div className="h-2" />

					{/* ME */}
					{me && (
						<div className="flex items-center gap-3 px-3 py-2 rounded-[16px] bg-[#D97706]/10 border border-[#D97706]/20">
							<div className="w-5 text-center text-[13px] font-bold text-[#D97706]">
								{meIndex + 1}
							</div>
							<Avatar photoUrl={getCachedImageUrl(me.photo_url) || ""} fullName={me.full_name} size={32} />
							<div className="flex flex-col min-w-0 flex-1">
								<span className="text-[13px] font-medium text-[#D97706] truncate">
									{getShortName(me.full_name)} (Вы)
								</span>
							</div>
							<span className="text-[13px] font-medium text-app-text">
								{me.points}
							</span>
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
			/>
		</div>
	);
}
