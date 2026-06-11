import { ChevronRight, Target } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { lastValue, useDashboardCharts } from "@/entities/dashboard";
import { useGrades } from "@/entities/grades";
import { useOverallSummary } from "@/features/goalForecast";
import {
	GRADE_BG,
	GRADE_COLOR,
	type Mark,
	pageConfig,
	RISK_BG,
	RISK_COLOR,
} from "@/shared/config";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";

function fmt(v: number | null): string {
	return v === null ? "—" : v.toFixed(2);
}

function pickBadgeLabel(
	risk: ReturnType<typeof useOverallSummary>["risk"],
	atRiskCount: number,
	totalSubjectsWithGoals: number,
): string {
	if (totalSubjectsWithGoals === 0) return "поставь цели";
	if (risk === "danger" || risk === "watch") return `${atRiskCount} в риске`;
	return "цели в норме";
}

export function GoalsSummaryCard({ className }: { className?: string }) {
	const navigate = useNavigate();
	const { progress, attendance } = useDashboardCharts({});
	const { entries } = useGrades();
	const summary = useOverallSummary();

	const avg = lastValue(progress);
	const att = lastValue(attendance);

	const distribution = useMemo(() => {
		const counts: Record<Mark, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
		for (const e of entries) {
			if (!e.marks) continue;
			for (const v of Object.values(e.marks)) {
				if (typeof v === "number" && v >= 1 && v <= 5) {
					counts[v as Mark] += 1;
				}
			}
		}
		return counts;
	}, [entries]);

	const totalMarks =
		distribution[1] +
		distribution[2] +
		distribution[3] +
		distribution[4] +
		distribution[5];

	const badgeRisk =
		summary.totalSubjectsWithGoals === 0 ? "no_goal" : summary.risk;
	const badgeLabel = pickBadgeLabel(
		summary.risk,
		summary.atRiskCount,
		summary.totalSubjectsWithGoals,
	);
	const isDesktop = useIsDesktop();

	if (isDesktop) {
		return (
			<div
				className={`w-full text-left rounded-[22px] p-6 border border-app-border bg-app-surface flex flex-col ${className ?? ""}`}
				style={{ boxShadow: "var(--shadow-card)" }}
			>
				<div className="flex items-center justify-between mb-8">
					<div className="text-[18px] font-bold text-app-text">
						Сводка оценок
					</div>
				</div>

				<div className="grid grid-cols-[repeat(auto-fit,minmax(84px,1fr))] gap-x-4 gap-y-5 mb-8">
					<div className="min-w-0">
						<div
							className="text-[28px] 2xl:text-[34px] font-bold leading-none tabular-nums break-words"
							style={{
								color:
									avg != null
										? avg >= 4.5
											? GRADE_COLOR[5]
											: avg >= 3.5
												? GRADE_COLOR[4]
												: avg >= 2.5
													? GRADE_COLOR[3]
													: GRADE_COLOR[2]
										: GRADE_COLOR[5],
							}}
						>
							{avg != null ? avg.toFixed(1) : "—"}
						</div>
						<div className="text-[12px] 2xl:text-[13px] text-app-muted mt-2 leading-snug">
							средний балл
						</div>
					</div>
					<div className="min-w-0">
						<div
							className="text-[28px] 2xl:text-[34px] font-bold leading-none tabular-nums break-words"
							style={{ color: GRADE_COLOR[4] }}
						>
							{att != null ? `${att}%` : "—"}
						</div>
						<div className="text-[12px] 2xl:text-[13px] text-app-muted mt-2 leading-snug">
							посещаемость
						</div>
					</div>
					<div className="min-w-0">
						<div className="text-[28px] 2xl:text-[34px] font-bold text-app-text leading-none tabular-nums break-words">
							{totalMarks}
						</div>
						<div className="text-[12px] 2xl:text-[13px] text-app-muted mt-2 leading-snug">
							всего оценок
						</div>
					</div>
				</div>

				{totalMarks > 0 && (
					<>
						<div
							className="flex rounded-full overflow-hidden mb-8"
							style={{ height: 10 }}
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

						<div className="flex flex-col gap-4 w-full">
							{([5, 4, 3, 2, 1] as const).map((v) => {
								const count = distribution[v];
								const pct =
									totalMarks > 0 ? Math.round((count / totalMarks) * 100) : 0;
								return (
									<div
										key={v}
										className="flex items-center gap-4 w-full"
										style={{ opacity: count === 0 ? 0.45 : 1 }}
									>
										<div
											className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center shrink-0"
											style={{ background: GRADE_BG[v] }}
										>
											<span
												className="text-[16px] font-bold leading-none"
												style={{ color: GRADE_COLOR[v] }}
											>
												{v}
											</span>
										</div>
										<div className="flex-1 h-2 rounded-full bg-app-surface-strong overflow-hidden shrink-0 min-w-[50px]">
											<div
												className="h-full rounded-full transition-all"
												style={{
													width: `${pct}%`,
													background: GRADE_COLOR[v],
												}}
											/>
										</div>
										<div className="w-10 text-right text-[16px] font-bold text-app-text tabular-nums shrink-0">
											{count}
										</div>
										<div className="w-10 text-right text-[14px] text-app-muted tabular-nums shrink-0">
											{pct}%
										</div>
									</div>
								);
							})}
						</div>
					</>
				)}

				<div className="mt-8 flex justify-center w-full">
					<button
						type="button"
						onClick={() => navigate(pageConfig.goals)}
						className="flex items-center justify-center gap-2 text-[14px] font-medium text-app-muted hover:text-app-text transition-colors"
					>
						<Target size={16} />
						Поставить цели
					</button>
				</div>
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={() => navigate(pageConfig.goals)}
			className={`w-full text-left rounded-[22px] p-4 border border-app-border bg-app-surface active:scale-[0.99] transition-transform flex flex-col ${className ?? ""}`}
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
