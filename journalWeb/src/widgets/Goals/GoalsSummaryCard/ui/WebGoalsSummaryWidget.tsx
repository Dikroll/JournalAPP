import {
	Award,
	BookOpen,
	Target,
	TrendingDown,
	TrendingUp,
	Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { calcTrend, lastValue, useDashboardCharts } from "@/entities/dashboard";
import { useGrades } from "@/entities/grades";
import { useLeaderboard } from "@/entities/leaderboard";
import { GRADE_COLOR } from "@/shared/config";

function formatTrend(value?: number, suffix = "") {
	if (value === undefined) return "нет данных";
	if (value === 0) return "без изменений";
	return `${value > 0 ? "+" : ""}${value}${suffix} за месяц`;
}

function MetricCard({
	title,
	value,
	accent,
	trend,
	icon,
}: {
	title: string;
	value: string;
	accent: string;
	trend: string;
	icon: ReactNode;
}) {
	const isPositive = trend.startsWith("+");
	const TrendIcon = isPositive ? TrendingUp : TrendingDown;

	return (
		<div className="relative min-h-[68px] min-w-0 overflow-hidden rounded-[13px] border border-app-border bg-app-surface-strong px-2 py-2">
			<div className="flex items-center justify-between gap-2">
				<div className="text-app-muted [&_svg]:h-3 [&_svg]:w-3 min-[1180px]:[&_svg]:h-3.5 min-[1180px]:[&_svg]:w-3.5">
					{icon}
				</div>
				<div
					className="h-1 w-5 rounded-full min-[1180px]:w-7"
					style={{ background: accent, boxShadow: `0 0 16px ${accent}66` }}
				/>
			</div>

			<div
				className="mt-1.5 truncate text-[16px] font-bold leading-none tabular-nums min-[1180px]:text-[18px]"
				style={{ color: accent }}
			>
				{value}
			</div>
			<div className="mt-1 truncate text-[8px] font-medium leading-tight text-app-muted min-[1180px]:text-[9px]">
				{title}
			</div>

			<div
				className="mt-1.5 flex min-w-0 items-center gap-1 text-[8px] font-semibold min-[1180px]:text-[9px]"
				style={{ color: accent }}
			>
				{trend === "без изменений" || trend === "нет данных" ? null : (
					<TrendIcon className="h-2.5 w-2.5 shrink-0" />
				)}
				<span className="truncate">{trend}</span>
			</div>
		</div>
	);
}

export function WebGoalsSummaryWidget({
	variant = "cube",
}: {
	variant?: "cube" | "line";
}) {
	const { progress, attendance } = useDashboardCharts();
	const { entries } = useGrades();
	const { myRankGroup } = useLeaderboard();

	const totalMarks = useMemo(() => {
		let total = 0;
		for (const entry of entries) {
			if (!entry.marks) continue;
			total += Object.values(entry.marks).filter(
				(mark) => mark !== null,
			).length;
		}
		return total;
	}, [entries]);

	const avg = lastValue(progress);
	const att = lastValue(attendance);
	const rankValue = myRankGroup
		? `${myRankGroup.position}/${myRankGroup.total}`
		: "-";

	const metrics = [
		{
			title: "средний балл",
			value: avg != null ? avg.toFixed(1) : "-",
			accent: "#10B981",
			trend: formatTrend(calcTrend(progress)),
			icon: <Target size={16} />,
		},
		{
			title: "посещаемость",
			value: att != null ? `${att}%` : "-",
			accent: "#3B82F6",
			trend: formatTrend(calcTrend(attendance), "%"),
			icon: <Users size={16} />,
		},
		{
			title: "всего оценок",
			value: totalMarks.toLocaleString("ru-RU"),
			accent: GRADE_COLOR[3],
			trend: `${totalMarks.toLocaleString("ru-RU")} сейчас`,
			icon: <BookOpen size={16} />,
		},
		{
			title: "место в группе",
			value: rankValue,
			accent: "#F43F5E",
			trend: myRankGroup
				? `top-${Math.max(1, Math.round((myRankGroup.position / myRankGroup.total) * 100))}%`
				: "нет данных",
			icon: <Award size={16} />,
		},
	];

	return (
		<div
			className="w-full rounded-3xl border border-app-border bg-app-surface p-2.5 shrink-0 min-h-0"
			style={{ boxShadow: "var(--shadow-card)" }}
		>
			<div className="mb-2 flex items-center gap-2 px-1">
				<Target size={14} className="shrink-0 text-app-muted" />
				<h2 className="text-[13px] font-bold leading-none text-app-text">
					Сводка оценок
				</h2>
			</div>
			<div
				className={`grid gap-2 min-[1180px]:gap-2.5 ${variant === "cube" ? "grid-cols-2" : "grid-cols-4"}`}
			>
				{metrics.map((metric) => (
					<MetricCard key={metric.title} {...metric} />
				))}
			</div>
		</div>
	);
}
