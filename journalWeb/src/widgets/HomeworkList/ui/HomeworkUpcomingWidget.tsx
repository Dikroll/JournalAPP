import { ChevronRight } from "lucide-react";
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
	
	return `Срок: ${deadline.split('-').reverse().join('.')}`;
}

export function HomeworkUpcomingWidget({ className = '' }: { className?: string }) {
	const navigate = useNavigate();
	const { items, counters } = useHomework();

	const overdueItems = items[STATUS_KEY_MAP.overdue] || [];
	const newItems = items[STATUS_KEY_MAP.new] || [];

	const upcoming = [...overdueItems, ...newItems]
		.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
		.slice(0, 3);

	return (
		<div
			className={`rounded-[20px] border border-app-border p-4 flex flex-col min-h-0 ${className}`}
			style={{
				background: "var(--color-surface)",
				boxShadow: "var(--shadow-card)",
			}}
		>
			<div className="flex items-center justify-between mb-4 shrink-0">
				<h2 className="text-sm font-bold text-app-text">Домашние задания</h2>
				<button
					onClick={() => navigate("/homework")}
					className="text-xs font-medium text-app-muted bg-app-surface-strong hover:bg-app-border px-3 py-1.5 rounded-xl transition-colors"
				>
					Все задания {counters?.total ? counters.total : ""}
				</button>
			</div>

			<div className="flex flex-col gap-2">
				{upcoming.length === 0 ? (
					<div className="text-app-muted text-sm py-4 text-center">
						Нет актуальных заданий
					</div>
				) : (
					upcoming.map((hw) => {
						const isOverdue = hw.status === STATUS_KEY_MAP.overdue;
						
						return (
							<div
								key={hw.id}
								className="flex items-center justify-between p-3 rounded-[14px] bg-app-surface-strong transition-colors hover:bg-app-border cursor-pointer group"
								onClick={() => navigate(`/homework/${hw.id}`)}
							>
								<div className="flex items-center gap-3 min-w-0 pr-3">
									<div 
										className="w-[2px] h-6 rounded-full" 
										style={{ background: isOverdue ? "var(--color-status-overdue, #ef4444)" : "var(--color-status-checked, #22c55e)" }} 
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
									<ChevronRight size={16} className="text-app-muted opacity-0 group-hover:opacity-100 transition-opacity" />
								</div>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
