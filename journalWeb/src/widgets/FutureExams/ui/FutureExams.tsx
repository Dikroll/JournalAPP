import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { useFutureExams } from "@/entities/exam";
import { illustrations } from "@/shared/config/illustrationsConfig";
import { EmptyState, SurfaceCard } from "@/shared/ui";
import { formatDate } from "@/shared/utils";
import { FutureExamsModal } from "./FutureExamsModal";

export function FutureExams({ limit }: { limit?: number } = {}) {
	const { exams, status } = useFutureExams();
	const [isModalOpen, setIsModalOpen] = useState(false);

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

	const displayExams = limit ? exams.slice(0, limit) : exams;
	const hasMore = limit ? exams.length > limit : false;

	return (
		<>
			<div className="flex flex-col gap-2">
				<ul className="flex flex-col gap-2">
					{displayExams.map((exam) => (
					<li key={`${exam.date}-${exam.spec}`}>
						<SurfaceCard paddingClassName="p-2.5" className="backdrop-blur-sm flex items-center gap-2.5">
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
						</SurfaceCard>
					</li>
				))}
			</ul>
			
			{hasMore && (
				<button
					onClick={() => setIsModalOpen(true)}
					className="w-full mt-2 py-2.5 rounded-xl border border-app-border bg-app-surface text-app-muted text-[13px] font-medium hover:bg-app-border hover:text-app-text transition-colors"
				>
					Показать все ({exams.length})
				</button>
			)}
		</div>

		<FutureExamsModal 
			isOpen={isModalOpen} 
			onClose={() => setIsModalOpen(false)} 
			exams={exams} 
		/>
		</>
	);
}
