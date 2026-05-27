import { CalendarDays } from "lucide-react";
import { useFutureExams } from "@/entities/exam";
import { illustrations } from "@/shared/config/illustrationsConfig";
import { EmptyState } from "@/shared/ui";
import { formatDate } from "@/shared/utils";

export function FutureExams() {
	const { exams, status } = useFutureExams();

	if (status === "loading" && exams.length === 0)
		return <p className="text-app-muted text-sm">Загрузка...</p>;

	if (status === "error")
		return <p className="text-status-overdue text-sm">Ошибка загрузки</p>;

	if (exams.length === 0)
		return (
			<EmptyState
				message="Нет предстоящих экзаменов"
				illustration={illustrations.noExams}
			/>
		);

	return (
		<div>
			<ul className="flex flex-col gap-2">
				{exams.map((exam) => (
					<li
						key={`${exam.date}-${exam.spec}`}
						className="bg-app-surface rounded-[14px] backdrop-blur-sm p-2.5 flex items-center gap-2.5"
					>
						<div
							className="flex-shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center"
							style={
								exam.days_left !== null && exam.days_left > 7
									? {
											background: "var(--color-checked-bg)",
											border: "1px solid var(--color-checked-border)",
										}
									: {
											background: "var(--color-overdue-bg)",
											border: "1px solid var(--color-overdue-border)",
										}
							}
						>
							<CalendarDays
								size={14}
								className={`mb-0.5 ${
									exam.days_left !== null && exam.days_left > 7
										? "text-status-checked"
										: "text-status-overdue"
								}`}
							/>
							{exam.days_left !== null && (
								<span
									className={`text-[9px] font-bold leading-none ${
										exam.days_left > 7
											? "text-status-checked"
											: "text-status-overdue"
									}`}
								>
									{exam.days_left}д
								</span>
							)}
						</div>
						<div className="flex flex-col min-w-0">
							<div
								className="font-medium text-[13px] leading-snug text-app-text line-clamp-2"
								title={exam.spec}
							>
								{exam.spec}
							</div>
							<div className="text-app-muted text-[11px] mt-0.5 truncate">
								{formatDate(exam.date)}
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
