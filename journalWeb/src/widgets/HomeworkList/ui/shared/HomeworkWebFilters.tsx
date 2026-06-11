import type { HomeworkCounters, HomeworkStatus } from "@/entities/homework";
import type { Subject } from "@/entities/subject";
import { SpecSelector } from "@/features/selectSpec";

interface Props {
	counters: HomeworkCounters;
	activeFilter: HomeworkStatus | null;
	onFilter: (key: HomeworkStatus | null) => void;
	subjects: Subject[];
	selectedSpec: Subject | null;
	onSubjectChange: (subject: Subject | null) => void;
	subjectsLoading?: boolean;
}

const FILTERS: Array<{
	label: string;
	status: HomeworkStatus | null;
	countKey: keyof HomeworkCounters;
	color?: string;
	widthClass: string;
}> = [
	{ label: "Все задания", status: null, countKey: "total", widthClass: "w-40" },
	{
		label: "Новые",
		status: "new",
		countKey: "new",
		color: "#3B82F6",
		widthClass: "w-[104px]",
	},
	{
		label: "На проверке",
		status: "pending",
		countKey: "pending",
		color: "#F59E0B",
		widthClass: "w-36",
	},
	{
		label: "Просроченные",
		status: "overdue",
		countKey: "overdue",
		color: "#EF4444",
		widthClass: "w-40",
	},
	{
		label: "Возвращено",
		status: "returned",
		countKey: "returned",
		color: "#94A3B8",
		widthClass: "w-36",
	},
];

export function HomeworkWebFilters({
	counters,
	activeFilter,
	onFilter,
	subjects,
	selectedSpec,
	onSubjectChange,
	subjectsLoading,
}: Props) {
	return (
		<section className="rounded-[20px] border border-app-border bg-app-surface p-3 shadow-[var(--shadow-card)]">
			<div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(300px,340px)] lg:items-center">
				<div className="flex min-w-0 items-center gap-2 overflow-x-auto scrollbar-none">
					{FILTERS.map(({ label, status, countKey, color, widthClass }) => {
						const isActive = activeFilter === status;
						const labelStyle = color ? { color } : undefined;
						const count = counters[countKey];

						return (
							<button
								key={label}
								type="button"
								onClick={() => onFilter(status)}
								className={[
									"flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border px-3.5 text-sm font-semibold transition-colors",
									widthClass,
									isActive
										? "border-app-border-strong bg-app-surface-active text-app-text"
										: "border-transparent text-app-muted hover:bg-app-surface-hover hover:text-app-text",
								].join(" ")}
							>
								<span
									className={[
										"min-w-0 truncate",
										color ? "" : isActive ? "text-app-text" : "text-app-muted",
									].join(" ")}
									style={labelStyle}
								>
									{label}
								</span>
								<span
									className={[
										"rounded-lg px-1.5 py-0.5 text-xs font-bold",
										isActive
											? color
												? "bg-app-surface"
												: "bg-app-surface text-app-text"
											: color
												? "bg-app-surface-strong"
												: "bg-app-surface-strong text-app-muted",
									].join(" ")}
									style={labelStyle}
								>
									{count}
								</span>
							</button>
						);
					})}
				</div>

				<div className="min-w-0">
					<SpecSelector
						subjects={subjects}
						selectedId={selectedSpec?.id ?? null}
						onChange={onSubjectChange}
						loading={subjectsLoading}
					/>
				</div>
			</div>
		</section>
	);
}
