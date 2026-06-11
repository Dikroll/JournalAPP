import { ChevronRight, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
	GRADE_BG,
	GRADE_COLOR,
	pageConfig,
	RISK_BG,
	RISK_COLOR,
} from "@/shared/config";
import { useGoalsSummaryData } from "../lib/useGoalsSummaryData";

function fmt(v: number | null): string {
	return v === null ? "—" : v.toFixed(2);
}

export function MobileGoalsSummaryCard({ className }: { className?: string }) {
	const navigate = useNavigate();
	const { avg, att, distribution, totalMarks, badgeRisk, badgeLabel, summary } =
		useGoalsSummaryData();

	return (
		<button
			type="button"
			onClick={() => navigate(pageConfig.goals)}
			className={`w-full text-left rounded-3xl p-4 border border-app-border bg-app-surface active:scale-[0.99] transition-transform flex flex-col ${className ?? ""}`}
			style={{ boxShadow: "var(--shadow-card)" }}
		>
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2">
					<Target size={16} className="text-app-muted" />
					<span className="text-sm font-bold text-app-text">Сводка оценок</span>
				</div>
				<ChevronRight size={18} className="text-app-muted" />
			</div>

			<div className="grid grid-cols-3 gap-3 mb-3">
				<div>
					<div className="text-[28px] font-bold text-app-text leading-none tabular-nums">
						{avg != null ? avg.toFixed(1) : "—"}
					</div>
					<div className="text-[12px] text-app-muted mt-1.5">средний балл</div>
				</div>
				<div>
					<div
						className="text-[28px] font-bold leading-none tabular-nums"
						style={{ color: GRADE_COLOR[4] }}
					>
						{att != null ? `${att}%` : "—"}
					</div>
					<div className="text-[12px] text-app-muted mt-1.5">посещаемость</div>
				</div>
				<div>
					<div className="text-[28px] font-bold text-app-text leading-none tabular-nums">
						{totalMarks}
					</div>
					<div className="text-[12px] text-app-muted mt-1.5">всего оценок</div>
				</div>
			</div>

			{totalMarks > 0 && (
				<>
					<div
						className="flex rounded-full overflow-hidden mb-3"
						style={{ height: 8 }}
					>
						{([5, 4, 3, 2, 1] as const).map((v) => {
							const pct = (distribution[v] / totalMarks) * 100;
							if (pct === 0) return null;
							return (
								<div
									key={v}
									style={{
										width: `${pct}%`,
										background: GRADE_COLOR[v],
									}}
								/>
							);
						})}
					</div>

					<div className="grid grid-cols-5 gap-1.5 mb-3 w-full">
						{([5, 4, 3, 2, 1] as const).map((v) => {
							const count = distribution[v];
							const pct =
								totalMarks > 0 ? Math.round((count / totalMarks) * 100) : 0;
							return (
								<div
									key={v}
									className="rounded-[14px] py-1 flex flex-col items-center justify-center w-full min-w-0"
									style={{
										background: GRADE_BG[v],
										opacity: count === 0 ? 0.45 : 1,
										minHeight: 56,
									}}
								>
									<span
										className="text-[20px] font-bold leading-none tabular-nums"
										style={{ color: GRADE_COLOR[v] }}
									>
										{v}
									</span>
									<span className="text-[12px] font-semibold text-app-text tabular-nums mt-1 leading-none">
										{count}
									</span>
									<span className="text-[10px] text-app-muted tabular-nums mt-0.5 leading-none">
										{pct}%
									</span>
								</div>
							);
						})}
					</div>
				</>
			)}

			<div className="mt-auto flex items-center justify-between w-full pt-3 border-t border-app-border">
				<span
					className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-medium"
					style={{
						color: RISK_COLOR[badgeRisk],
						background: RISK_BG[badgeRisk],
					}}
				>
					● {badgeLabel}
				</span>
				{summary.totalSubjectsWithGoals > 0 && (
					<span className="text-[12px] text-app-muted">
						прогноз{" "}
						<strong className="text-app-text tabular-nums">
							{fmt(summary.forecast)}
						</strong>{" "}
						· цель{" "}
						<strong className="text-app-text tabular-nums">
							{fmt(summary.target)}
						</strong>
					</span>
				)}
			</div>
		</button>
	);
}
