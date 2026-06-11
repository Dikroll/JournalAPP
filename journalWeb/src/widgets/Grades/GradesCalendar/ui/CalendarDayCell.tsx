import { useState } from "react";
import { getGradeDotInfo, type GradeEntryExpanded } from "@/entities/grades";
import { formatDateWithWeekday } from "@/shared/utils";

interface Props {
	dateStr: string;
	day: number;
	isToday: boolean;
	isSelected: boolean;
	entries: GradeEntryExpanded[];
	onClick: (dateStr: string, hasData: boolean) => void;
}

export function CalendarDayCell({
	dateStr,
	day,
	isToday,
	isSelected,
	entries,
	onClick,
}: Props) {
	const [isHovered, setIsHovered] = useState(false);

	const hasData = entries.length > 0;
	const dotInfo = hasData ? getGradeDotInfo(entries) : null;
	const tooltip = dotInfo
		? `${formatDateWithWeekday(dateStr)}. ${dotInfo.label}: ${dotInfo.description}`
		: undefined;

	return (
		<button
			type="button"
			disabled={!hasData}
			onClick={() => onClick(dateStr, hasData)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onFocus={() => setIsHovered(true)}
			onBlur={() => setIsHovered(false)}
			title={tooltip}
			aria-label={tooltip}
			className="relative flex items-center justify-center rounded-full text-xs font-semibold disabled:cursor-default"
			style={{
				width: 36,
				height: 36,
				WebkitTapHighlightColor: "transparent",
				background: isSelected
					? "var(--color-brand)"
					: isHovered
						? "var(--color-surface-hover)"
						: "transparent",
				color: isSelected
					? "#fff"
					: hasData
						? "var(--color-text)"
						: "var(--color-text-faint)",
			}}
		>
			{day}

			{isToday && !isSelected && (
				<span
					className="absolute inset-0 rounded-full pointer-events-none"
					style={{ boxShadow: "0 0 0 1.5px var(--color-brand)" }}
				/>
			)}

			{dotInfo && !isSelected && (
				<span
					className="absolute rounded-full pointer-events-none"
					style={{
						width: 4,
						height: 4,
						bottom: 3,
						left: "50%",
						transform: "translateX(-50%)",
						backgroundColor: dotInfo.color,
					}}
				/>
			)}
		</button>
	);
}
