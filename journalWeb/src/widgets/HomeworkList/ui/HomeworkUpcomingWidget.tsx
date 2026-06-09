import { BookOpen, CheckCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHomework } from "@/entities/homework";
import { STATUS_KEY_MAP } from "@/entities/homework/configs/homeworkConfig";
import { getTodayString } from "@/shared/utils";

function getDeadlineLabel(deadline: string, isOverdue: boolean) {
	if (isOverdue) return "Просрочено";

	const todayStr = getTodayString();
	if (deadline === todayStr) return "Срок: сегодня";

	const tmr = new Date();
	tmr.setDate(tmr.getDate() + 1);
	const tmrStr = tmr.toISOString().split("T")[0];
	if (deadline === tmrStr) return "Срок: завтра";

	return `Срок: ${deadline.split("-").reverse().join(".")}`;
}

export function HomeworkUpcomingWidget({
	className = "",
	limit = 3,
}: {
	className?: string;
	limit?: number;
}) {
	const navigate = useNavigate();
	const { items, counters } = useHomework();

	const overdueItems = items[STATUS_KEY_MAP.overdue] || [];
	const newItems = items[STATUS_KEY_MAP.new] || [];

	const fullUpcoming = [...overdueItems, ...newItems].sort(
		(a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
	);

	const upcoming = limit ? fullUpcoming.slice(0, limit) : fullUpcoming;
	const hasMore = limit ? fullUpcoming.length > limit : false;
	const shouldShowFooter =
		hasMore || upcoming.length < fullUpcoming.length || limit !== undefined;

	return (
		<div
			className={`rounded-[20px] border border-app-border p-4 flex flex-col min-h-0 ${className}`}
			style={{
				background: "var(--color-surface)",
				boxShadow: "var(--shadow-card)",
			}}
		>
			<div className="flex items-center justify-between mb-4 shrink-0">
				<h2 className="text-sm font-bold text-app-text flex items-center gap-2">
					<BookOpen size={16} className="text-app-muted shrink-0" />
					<span>Домашние задания</span>
				</h2>
				<button
					type="button"
					onClick={() => navigate("/homework")}
					className="text-xs font-medium text-app-muted bg-app-surface-strong hover:bg-app-surface-active hover:text-app-text px-3 py-1.5 rounded-xl transition-colors"
				>
					Все задания {counters?.total ? counters.total : ""}
				</button>
			</div>

			<div className="flex flex-col gap-2 flex-1 min-h-0">
				{upcoming.map((hw) => {
					const isOverdue = hw.status === STATUS_KEY_MAP.overdue;

					return (
						<button
							key={hw.id}
							type="button"
							className="flex w-full items-center justify-between p-3 rounded-[14px] bg-app-surface-strong border border-app-border transition-colors hover:bg-app-surface-active cursor-pointer group text-left shrink-0"
							onClick={() => navigate("/homework")}
						>
							<div className="flex items-center gap-3 min-w-0 pr-3">
								<div
									className="w-[2px] h-6 rounded-full shrink-0"
									style={{
										background: isOverdue
											? "var(--color-status-overdue, #ef4444)"
											: "var(--color-status-checked, #22c55e)",
									}}
								/>
								<div className="flex flex-col min-w-0">
									<span className="text-[13px] font-medium text-app-text truncate">
										{hw.spec_name}
									</span>
									{hw.theme && (
										<span className="text-[12px] text-app-muted truncate mt-0.5">
											{hw.theme}
										</span>
									)}
								</div>
							</div>
							<div className="flex items-center gap-2 shrink-0">
								<div
									className={`px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap flex items-center gap-1 ${
										isOverdue
											? "bg-status-overdue/10 text-status-overdue"
											: "bg-app-surface text-app-muted"
									}`}
								>
									{getDeadlineLabel(hw.deadline, isOverdue)}
								</div>
								<ChevronRight
									size={16}
									className="text-app-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
								/>
							</div>
						</button>
					);
				})}

				{upcoming.length === 0 ? (
					<div className="flex-1 flex flex-col items-center justify-center min-h-[120px] opacity-40 select-none pointer-events-none mt-2 shrink-0">
						<CheckCircle size={32} className="mb-2 text-app-muted" />
						<p className="text-[13px] font-medium text-app-muted text-center leading-snug">
							Нет актуальных заданий
							<br />
							Вы всё сдали!
						</p>
					</div>
				) : (
					shouldShowFooter && (
						<button
							type="button"
							onClick={() => navigate("/homework")}
							className={`w-full mt-2 py-2.5 rounded-xl border text-[13px] font-medium transition-colors shrink-0 ${
								hasMore
									? "border-app-border bg-app-surface text-app-muted hover:bg-app-surface-active hover:text-app-text"
									: "border-transparent bg-transparent text-app-muted/50 hover:bg-app-surface-active hover:text-app-text"
							}`}
						>
							{hasMore
								? `Показать все (${fullUpcoming.length})`
								: "Это все актуальные задания"}
						</button>
					)
				)}
			</div>
		</div>
	);
}
