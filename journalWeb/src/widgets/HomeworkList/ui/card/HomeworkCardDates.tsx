import { Calendar, Clock } from "lucide-react";
import { getDaysUntilDeadline } from "@/shared/utils";

interface Props {
	issuedDate: string;
	deadline: string;
	isOverdue: boolean;
	isNew?: boolean;
}

function getUrgencyLabel(daysLeft: number): string {
	if (daysLeft === 0) return "сегодня";
	if (daysLeft === 1) return "завтра";
	return `${daysLeft} дня`;
}

export function HomeworkCardDates({
	issuedDate,
	deadline,
	isOverdue,
	isNew,
}: Props) {
	const daysLeft = isNew && !isOverdue ? getDaysUntilDeadline(deadline) : null;

	const isUrgentRed = daysLeft === 0;
	const isUrgentYellow = daysLeft != null && daysLeft >= 1 && daysLeft <= 3;
	const isUrgent = isUrgentRed || isUrgentYellow;

	return (
		<div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
			<div className="flex min-w-0 items-center gap-1.5 text-sm text-app-muted">
				<Calendar size={13} className="shrink-0" />
				<span className="break-all">{issuedDate}</span>
			</div>
			<div className="flex min-w-0 flex-wrap items-center gap-1.5 text-sm">
				<Clock
					size={13}
					className={
						isOverdue || isUrgentRed
							? "shrink-0 text-status-overdue"
							: isUrgentYellow
								? "shrink-0 text-status-pending"
								: "shrink-0 text-app-muted"
					}
				/>
				<span
					className={`break-all ${
						isOverdue
							? "text-status-overdue font-semibold"
							: isUrgentRed
								? "text-status-overdue font-semibold drop-shadow-[0_0_6px_rgba(220,38,38,0.6)]"
								: isUrgentYellow
									? "text-status-pending font-semibold drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]"
									: "text-app-muted"
					}`}
				>
					{deadline}
				</span>

				{isUrgent && daysLeft != null && (
					<span
						className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
							isUrgentRed
								? "bg-overdue-bg text-status-overdue"
								: "bg-pending-subtle text-status-pending"
						}`}
					>
						{getUrgencyLabel(daysLeft)}
					</span>
				)}
			</div>
		</div>
	);
}
