import { Hourglass, UtensilsCrossed } from "lucide-react";
import {
	formatGapMinutes,
	type GapInfo,
} from "@/entities/schedule/lib/scheduleGaps";

import type { LessonCardVariant } from "./LessonCard";

interface Props {
	gap: GapInfo;
	compact?: boolean;
	variant?: LessonCardVariant;
}

export function GapIndicator({ gap, compact = false, variant = "default" }: Props) {
	if (gap.minutes <= 0 || gap.type === "break") return null;

	const isLunch = gap.type === "lunch";
	const Icon = isLunch ? UtensilsCrossed : Hourglass;
	const label = isLunch ? "Обед" : "Окно";
	const color = isLunch ? "#F59E0B" : "#8B5CF6";
	const isHomeDesktop = variant === "homeDesktop";

	if (isHomeDesktop) {
		return (
			<div className="relative flex items-center h-8">
				{/* Timeline gap dot/icon */}
				<div 
					className="absolute left-[16px] -translate-x-1/2 flex items-center justify-center w-5 h-5 rounded-full z-10"
					style={{ background: 'var(--color-surface)' }}
				>
					<Icon size={12} style={{ color }} />
				</div>
				<div className="pl-[36px] flex flex-1 items-center gap-3">
					<span className="text-[12px] font-medium" style={{ color }}>
						{label} • {formatGapMinutes(gap.minutes)}
					</span>
					<div className="flex-1 h-px border-b border-dashed" style={{ borderColor: `${color}40` }} />
				</div>
			</div>
		);
	}

	return (
		<div
			className={`schedule-gap-indicator flex items-center gap-2 px-4 ${compact ? "py-0.5" : "py-1.5"}`}
		>
			<div className="flex-1 h-px" style={{ background: `${color}30` }} />
			<div
				className="schedule-gap-indicator__label flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 border"
				style={{
					background: `${color}10`,
					borderColor: `${color}25`,
				}}
			>
				<Icon size={10} style={{ color }} />
				<span className="text-[10px] font-medium leading-none whitespace-nowrap" style={{ color }}>
					{label} · {formatGapMinutes(gap.minutes)}
				</span>
			</div>
			<div className="flex-1 h-px" style={{ background: `${color}30` }} />
		</div>
	);
}
