import { BadgeCheck } from "lucide-react";
import type { LeaderboardStudent } from "@/entities/leaderboard";
import { getCachedImageUrl } from "@/shared/lib";
import { Avatar } from "@/shared/ui";
import { getShortName } from "@/shared/utils/nameUtils";
import { getRankColor, HIGHLIGHT } from "../lib/constants";

interface Props {
	student: LeaderboardStudent;
	isMe: boolean;
	rank: number;
	onPhotoClick?: (url: string) => void;
}

export function LeaderboardRow({ student, isMe, rank, onPhotoClick }: Props) {
	return (
		<div
			className="flex items-center gap-3 px-3 py-2 rounded-3xl transition-colors hover:bg-app-surface-strong"
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
				onClick={
					onPhotoClick && student.photo_url
						? () => {
								onPhotoClick(
									getCachedImageUrl(student.photo_url) || student.photo_url!,
								);
							}
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
}
