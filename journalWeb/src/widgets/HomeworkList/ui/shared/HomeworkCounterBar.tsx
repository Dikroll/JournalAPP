import type { HomeworkCounters, HomeworkStatus } from "@/entities/homework";

interface Props {
	counters: HomeworkCounters;
	activeFilter: HomeworkStatus | null;
	onFilter: (key: HomeworkStatus | null) => void;
	isVertical?: boolean;
	readonly?: boolean;
	withIcons?: boolean;
	columns?: number;
}

import {
	CheckCircle2,
	Flame,
	Hourglass,
	Inbox,
	RotateCcw,
	Sparkles,
} from "lucide-react";

const ITEMS = [
	{
		key: "total",
		label: "Всего",
		color: "text-app-text",
		icon: Inbox,
		statusKey: "total",
		status: null,
	},
	{
		key: "new",
		label: "Новых",
		color: "text-status-new",
		icon: Sparkles,
		statusKey: "new",
		status: "new" as HomeworkStatus,
	},
	{
		key: "pending",
		label: "На проверке",
		color: "text-status-pending",
		icon: Hourglass,
		statusKey: "pending",
		status: "pending" as HomeworkStatus,
	},
	{
		key: "checked",
		label: "Проверено",
		color: "text-status-checked",
		icon: CheckCircle2,
		statusKey: "checked",
		status: "checked" as HomeworkStatus,
	},
	{
		key: "overdue",
		label: "Просрочено",
		color: "text-status-overdue",
		icon: Flame,
		statusKey: "overdue",
		status: "overdue" as HomeworkStatus,
	},
	{
		key: "returned",
		label: "Возвращено",
		color: "text-status-returned",
		icon: RotateCcw,
		statusKey: "returned",
		status: "returned" as HomeworkStatus,
	},
] as const;

export function HomeworkCountersBar({
	counters,
	activeFilter,
	onFilter,
	isVertical = false,
	readonly = false,
	withIcons = false,
	columns,
}: Props) {
	return (
		<div
			className={
				columns
					? "w-full"
					: `-mx-4 homework-counters-bar ${isVertical ? "mx-0 flex-1 min-h-0 relative" : "overflow-x-auto"}`
			}
		>
			<div
				className={
					columns
						? ""
						: `flex gap-2 ${isVertical ? "absolute inset-0 flex-col px-0 overflow-y-auto scrollbar-none" : "px-4 w-max py-2"} homework-counters-bar__inner`
				}
			>
				<div
					className={
						columns
							? `grid gap-2 w-full ${columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : ""}`
							: `flex gap-2 ${isVertical ? "flex-col w-full min-h-full h-full justify-between" : ""}`
					}
				>
					{ITEMS.map(({ key, label, color, icon: Icon, statusKey, status }) => {
						const isClickable = !readonly;
						const isActive = isClickable && activeFilter === status;

						const ring =
							statusKey === "total"
								? "ring-app-border-strong"
								: `ring-status-${statusKey}`;
						const bgColor =
							statusKey === "total"
								? "rgba(255, 255, 255, 0.05)"
								: `var(--color-${statusKey}-subtle, rgba(255,255,255,0.05))`;
						const borderColor =
							statusKey === "total"
								? "var(--color-border)"
								: `var(--color-${statusKey}-border, rgba(255,255,255,0.1))`;

						if (isVertical || columns) {
							return (
								<button
									key={key}
									type="button"
									disabled={readonly}
									onClick={
										isClickable
											? () => onFilter(isActive ? null : status)
											: undefined
									}
									className={[
										"flex items-center justify-between px-3 py-2 rounded-[16px] transition-all duration-200 w-full flex-1 shrink-0 min-h-[48px] max-h-[64px]",
										isClickable
											? "active:scale-95 cursor-pointer"
											: "cursor-default",
										isActive
											? `bg-app-surface-active ring-2 ${ring}`
											: `bg-app-surface border border-app-border ${isClickable ? "hover:bg-app-surface-hover" : ""}`,
									].join(" ")}
								>
									<div className="flex items-center gap-3">
										<div
											className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
											style={{
												background: bgColor,
												border: `1px solid ${borderColor}`,
											}}
										>
											<Icon size={16} className={color} />
										</div>
										<span className="text-[14px] font-semibold text-app-text">
											{label}
										</span>
									</div>
									<span className={`text-[16px] font-bold ${color}`}>
										{counters[key]}
									</span>
								</button>
							);
						}

						return (
							<button
								key={key}
								type="button"
								disabled={readonly}
								onClick={
									isClickable
										? () => onFilter(isActive ? null : status)
										: undefined
								}
								className={[
									"flex-shrink-0 min-w-[72px] rounded-3xl px-3 py-2 transition-all duration-200 homework-counters-bar__btn",
									withIcons
										? "flex items-center gap-3 text-left"
										: "text-center",
									isClickable
										? "active:scale-95 cursor-pointer"
										: "cursor-default",
									isActive
										? `bg-app-surface-active ring-2 ${ring}`
										: `bg-app-surface border border-app-border ${isClickable ? "hover:bg-app-surface-hover" : ""}`,
								].join(" ")}
							>
								{withIcons && (
									<div
										className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
										style={{
											background: bgColor,
											border: `1px solid ${borderColor}`,
										}}
									>
										<Icon size={16} className={color} />
									</div>
								)}
								<div className={withIcons ? "min-w-0" : ""}>
									<div className={`text-lg font-bold leading-tight ${color}`}>
										{counters[key]}
									</div>
									<div className="truncate text-xs text-app-muted">{label}</div>
								</div>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
