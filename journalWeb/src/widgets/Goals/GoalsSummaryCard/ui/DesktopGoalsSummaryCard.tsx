import { Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GRADE_BG, GRADE_COLOR, pageConfig } from "@/shared/config";
import { useGoalsSummaryData } from "../lib/useGoalsSummaryData";

export function DesktopGoalsSummaryCard({ className }: { className?: string }) {
	const navigate = useNavigate();
	const { avg, att, distribution, totalMarks } = useGoalsSummaryData();

	return (
		<div
			className={`w-full text-left rounded-3xl p-6 border border-app-border bg-app-surface flex flex-col ${className ?? ""}`}
			style={{ boxShadow: "var(--shadow-card)" }}
		>
			<div className="flex items-center justify-between mb-8">
				<div className="text-[18px] font-bold text-app-text">Сводка оценок</div>
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
