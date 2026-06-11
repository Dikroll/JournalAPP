import { BadgeCheck, Crown } from "lucide-react";
import type { LeaderboardStudent } from "@/entities/leaderboard";
import { getCachedImageUrl } from "@/shared/lib";
import { Avatar } from "@/shared/ui";
import { getShortName } from "@/shared/utils/nameUtils";
import { getRankColor, RANK_SURFACES } from "../lib/constants";

interface Props {
	top3: LeaderboardStudent[];
	onPhotoClick?: (url: string) => void;
}

export function TopThreeModalList({ top3, onPhotoClick }: Props) {
	return (
		<div className="flex justify-center gap-4 sm:gap-8 mb-8">
			{[
				{ student: top3[1], rank: 2, mt: "mt-8" },
				{ student: top3[0], rank: 1, mt: "mt-0" },
				{ student: top3[2], rank: 3, mt: "mt-12" },
			].map(({ student, rank, mt }) => {
				if (!student)
					return <div key={rank} className={`w-[7.5rem] sm:w-40 ${mt}`} />;
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
								onClick={
									onPhotoClick && student.photo_url
										? () =>
												onPhotoClick(
													getCachedImageUrl(student.photo_url) ||
														student.photo_url!,
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
	);
}
