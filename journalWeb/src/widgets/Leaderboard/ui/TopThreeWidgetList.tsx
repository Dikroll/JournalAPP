import { BadgeCheck, Crown } from "lucide-react";
import type { LeaderboardStudent } from "@/entities/leaderboard";
import { getCachedImageUrl } from "@/shared/lib";
import { Avatar } from "@/shared/ui";
import { getShortName } from "@/shared/utils/nameUtils";
import { getRankColor, RANK_SURFACES } from "../lib/constants";

interface Props {
	paddedTop3: (LeaderboardStudent | null)[];
	onPhotoClick?: (url: string) => void;
}

export function TopThreeWidgetList({ paddedTop3, onPhotoClick }: Props) {
	return (
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
								onClick={
									onPhotoClick && s.photo_url
										? () =>
												onPhotoClick(
													getCachedImageUrl(s.photo_url) || s.photo_url!,
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
	);
}
