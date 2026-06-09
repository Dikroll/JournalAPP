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
}> = [
	{ label: "Все задания", status: null, countKey: "total" },
	{ label: "Новые", status: "new", countKey: "new", color: "#3B82F6" },
	{
		label: "На проверке",
		status: "pending",
		countKey: "pending",
		color: "#F59E0B",
	},
	{
		label: "Просроченные",
		status: "overdue",
		countKey: "overdue",
		color: "#EF4444",
	},
	{
		label: "Возвращено",
		status: "returned",
		countKey: "returned",
		color: "#94A3B8",
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
			<div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(300px,340px)] xl:items-center">
				<div className="flex min-w-0 items-center gap-2 overflow-x-auto scrollbar-none">
					{FILTERS.map(({ label, status, countKey, color }) => {
						const isActive = activeFilter === status;
						const labelStyle = color ? { color } : undefined;

						return (
							<button
								key={label}
								type="button"
								onClick={() => onFilter(status)}
								className={[
									"flex h-11 shrink-0 items-center gap-2 rounded-2xl px-3.5 text-sm font-semibold transition-colors",
									isActive
										? "border border-app-border-strong bg-app-surface-active text-app-text"
										: "border border-transparent text-app-muted hover:bg-app-surface-hover hover:text-app-text",
								].join(" ")}
							>
								<span
									className={[
										"whitespace-nowrap",
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
									{counters[countKey]}
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
