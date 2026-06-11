import { Coins, Gem, TrendingUp } from "lucide-react";
import { memo } from "react";
import type { ActivityViewItem } from "@/entities/dashboard";

function getPointTypeIcon(pointType: string) {
	switch (pointType) {
		case "COIN":
			return <Gem size={16} className="text-[#00D9FF]" />;
		case "DIAMOND":
			return <Coins size={16} className="text-[#FFD700]" />;
		default:
			return <TrendingUp size={16} className="text-status-checked" />;
	}
}

interface Props {
	item: ActivityViewItem;
	index: number;
	desktop?: boolean;
}

export const ActivityCard = memo(function ActivityCard({
	item,
	index,
	desktop = false,
}: Props) {
	return (
		<div
			className={`${desktop ? "rounded-3xl p-5 min-h-[148px]" : "rounded-[26px] p-4"} border border-app-border relative overflow-hidden`}
			style={{
				boxShadow: "var(--shadow-card)",
				background:
					index % 2 === 0
						? `linear-gradient(135deg, ${item.accentColor} 0%, transparent 55%), var(--color-surface)`
						: `linear-gradient(225deg, ${item.accentColor} 0%, transparent 50%), var(--color-surface)`,
			}}
		>
			<div
				className={`${desktop ? "top-5 bottom-5" : "top-4 bottom-4"} absolute left-0 w-1 rounded-full`}
				style={{ background: item.accentBorder }}
			/>

			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 pl-3">
					<p className="text-sm font-semibold text-app-text leading-snug">
						{item.title}
					</p>
					<p className="text-xs text-app-muted mt-1">
						{desktop ? item.timeLabel : item.dateLabel}
					</p>
				</div>

				<div className="text-right shrink-0">
					<p
						className={`${desktop ? "text-2xl" : "text-lg"} font-bold text-app-text`}
					>
						{item.pointsLabel}
					</p>
				</div>
			</div>

			<div
				className={`${desktop ? "mt-5" : "mt-3"} flex items-center justify-between gap-3 pl-3`}
			>
				<div
					className="inline-flex items-center gap-2 rounded-full px-3 py-1.5"
					style={{
						background: item.accentColor,
						border: `1px solid ${item.accentBorder}`,
					}}
				>
					{getPointTypeIcon(item.pointType)}
					<span className="text-xs font-medium text-app-text">
						{item.pointTypeLabel}
					</span>
				</div>

				<div className="text-[11px] uppercase tracking-[0.12em] text-app-muted">
					{item.isSpend ? "Списание" : "Начисление"}
				</div>
			</div>
		</div>
	);
});
