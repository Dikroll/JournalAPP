import {
	CalendarDays,
	CheckCircle2,
	Clock3,
	FileText,
	GraduationCap,
	Sparkles,
} from "lucide-react";
import type {
	HomeworkCounters,
	HomeworkItem,
	HomeworkItemWithStatus,
	HomeworkStatus,
} from "@/entities/homework";
import { STATUS_KEY_MAP } from "@/entities/homework";
import { getTodayString } from "@/shared/utils";

interface Props {
	counters: HomeworkCounters;
	items: Record<string, HomeworkItem[]>;
	onFilter?: (key: HomeworkStatus | null) => void;
}

function getWeekNewCount(items: Record<string, HomeworkItem[]>) {
	const newItems = items[STATUS_KEY_MAP.new] ?? [];
	const today = new Date(getTodayString());
	const weekEnd = new Date(today);
	weekEnd.setDate(today.getDate() + 7);

	return newItems.filter((item) => {
		const issued = new Date(item.issued_date);
		return issued >= today && issued <= weekEnd;
	}).length;
}

function formatDeadlineLabel(deadline: string) {
	const today = getTodayString();
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	const tomorrowString = tomorrow.toISOString().split("T")[0];

	if (deadline === today) return "Сегодня";
	if (deadline === tomorrowString) return "Завтра";

	return deadline.split("-").reverse().join(".");
}

function getHomeworkWord(count: number) {
	const abs = Math.abs(count);
	const lastTwo = abs % 100;
	const last = abs % 10;

	if (lastTwo >= 11 && lastTwo <= 14) return "новых заданий";
	if (last === 1) return "новое задание";
	if (last >= 2 && last <= 4) return "новых задания";

	return "новых заданий";
}

function getNearestDeadline(
	items: Record<string, HomeworkItem[]>,
): HomeworkItemWithStatus | undefined {
	const statuses: HomeworkStatus[] = ["new", "returned"];
	const activeItems = statuses.flatMap((status) =>
		(items[STATUS_KEY_MAP[status]] ?? []).map((hw) => ({
			...hw,
			statusKey: status,
		})),
	);

	return activeItems.sort(
		(a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
	)[0];
}

function focusHomeworkCard(homeworkId: number) {
	let attempts = 0;

	const tryFocus = () => {
		attempts++;
		const elements = document.querySelectorAll<HTMLElement>(
			`#hw-card-${homeworkId}`,
		);
		const target = Array.from(elements).find((element) => {
			const rect = element.getBoundingClientRect();
			return rect.width > 0 && rect.height > 0;
		});

		if (!target) {
			if (attempts < 12) window.setTimeout(tryFocus, 50);
			return;
		}

		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		target.scrollIntoView({
			behavior: prefersReducedMotion ? "auto" : "smooth",
			block: "center",
		});

		target.dataset.deadlineFocus = "false";
		window.setTimeout(
			() => {
				target.dataset.deadlineFocus = "true";
			},
			prefersReducedMotion ? 0 : 220,
		);

		window.setTimeout(
			() => {
				delete target.dataset.deadlineFocus;
			},
			prefersReducedMotion ? 900 : 1700,
		);
	};

	window.setTimeout(tryFocus, 50);
}

export function HomeworkWebOverview({ counters, items, onFilter }: Props) {
	const weekNew = getWeekNewCount(items) || counters.new;
	const nearestDeadline = getNearestDeadline(items);

	return (
		<div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2.1fr)_minmax(280px,0.9fr)]">
			<section className="flex flex-col rounded-[20px] border border-app-border bg-app-surface p-5 shadow-[var(--shadow-card)] h-full">
				<div className="flex-1 grid min-h-[150px] grid-cols-3 items-stretch gap-4 lg:grid-cols-[minmax(220px,1fr)_repeat(3,minmax(116px,0.45fr))]">
					<div className="col-span-3 flex min-w-0 flex-col justify-between rounded-2xl border border-brand/20 bg-brand/10 p-4 lg:col-span-1">
						<div className="flex items-center justify-between gap-2">
							<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-brand/25 bg-brand/15 text-brand">
								<FileText size={26} />
							</div>
							<p className="text-sm font-medium text-app-muted">
								На этой неделе
							</p>
						</div>
						<div className="mt-5 min-w-0">
							<h2 className="mt-1 text-2xl font-bold leading-tight text-app-text xl:text-[28px]">
								{weekNew} {getHomeworkWord(weekNew)}
							</h2>
						</div>
					</div>

					<div className="flex min-w-0 flex-col justify-between rounded-2xl border border-status-new/20 bg-status-new/10 p-4">
						<div className="flex items-center justify-between gap-2">
							<span className="text-[34px] font-bold leading-none text-status-new xl:text-[42px]">
								{counters.new}
							</span>
							<Sparkles size={18} className="text-status-new" />
						</div>
						<p className="text-sm font-medium text-app-muted">Новых</p>
					</div>

					<div className="flex min-w-0 flex-col justify-between rounded-2xl border border-status-pending/20 bg-status-pending/10 p-4">
						<div className="flex items-center justify-between gap-2">
							<span className="text-[34px] font-bold leading-none text-status-pending xl:text-[42px]">
								{counters.pending}
							</span>
							<Clock3 size={18} className="text-status-pending" />
						</div>
						<p className="text-sm font-medium text-app-muted leading-snug">
							На проверке
						</p>
					</div>

					<div className="flex min-w-0 flex-col justify-between rounded-2xl border border-status-overdue/20 bg-status-overdue/10 p-4">
						<div className="flex items-center justify-between gap-2">
							<span className="text-[34px] font-bold leading-none text-status-overdue xl:text-[42px]">
								{counters.overdue}
							</span>
							<Clock3 size={18} className="text-status-overdue" />
						</div>
						<p className="text-sm font-medium text-app-muted leading-snug">
							Просрочено
						</p>
					</div>
				</div>
			</section>

			<section className="min-h-[178px] rounded-[20px] border border-app-border bg-app-surface p-5 shadow-[var(--shadow-card)]">
				<div className="mb-5 flex items-center justify-between gap-3">
					<p className="text-sm font-semibold text-app-muted">
						Ближайший дедлайн
					</p>
					<CalendarDays size={18} className="text-app-muted" />
				</div>

				{nearestDeadline ? (
					<button
						type="button"
						onClick={() => {
							if (onFilter) onFilter(null);
							focusHomeworkCard(nearestDeadline.id);
						}}
						className="block w-full text-left focus:outline-none group"
					>
						<p className="text-sm font-bold text-status-pending group-hover:opacity-80 transition-opacity">
							{formatDeadlineLabel(nearestDeadline.deadline)}
						</p>
						<h3 className="mt-3 line-clamp-2 text-base font-bold text-app-text group-hover:text-brand transition-colors">
							{nearestDeadline.theme || nearestDeadline.spec_name}
						</h3>
						<p className="mt-1 line-clamp-2 text-sm leading-snug text-app-muted">
							{nearestDeadline.spec_name}
						</p>
						{nearestDeadline.teacher && (
							<div className="flex items-center gap-1.5 mt-2 text-[12px]">
								<GraduationCap
									size={13}
									className="text-app-text flex-shrink-0"
								/>
								<span className="text-app-text font-medium truncate">
									{nearestDeadline.teacher}
								</span>
							</div>
						)}
					</button>
				) : (
					<div className="flex min-h-[86px] items-center gap-3 text-app-muted">
						<CheckCircle2 size={20} className="text-status-checked" />
						<span className="text-sm font-medium">Нет активных дедлайнов</span>
					</div>
				)}
			</section>
		</div>
	);
}
