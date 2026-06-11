import {
	CalendarDays,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { useCloseOnOutsideClick } from "@/shared/hooks/useCloseOnOutsideClick";
import {
	formatDateShort,
	getDaysInMonth,
	getFirstDayOfMonth,
	getTodayString,
	RU_DAYS_SHORT,
	RU_MONTHS,
	toDateString,
} from "@/shared/utils";

function getMonthFromDate(date: string) {
	const parsed = date ? new Date(`${date}T00:00:00`) : new Date();
	return {
		year: parsed.getFullYear(),
		month: parsed.getMonth(),
	};
}

export interface DesktopDateRangePickerProps {
	startDate: string;
	endDate: string;
	onStartDateChange: (date: string) => void;
	onEndDateChange: (date: string) => void;
}

export function DesktopDateRangePicker({
	startDate,
	endDate,
	onStartDateChange,
	onEndDateChange,
}: DesktopDateRangePickerProps) {
	const [open, setOpen] = useState(false);
	const [{ year, month }, setVisibleMonth] = useState(() =>
		getMonthFromDate(endDate || startDate),
	);
	const ref = useCloseOnOutsideClick<HTMLDivElement>(
		open,
		useCallback(() => setOpen(false), []),
	);
	const today = useMemo(() => getTodayString(), []);
	const daysInMonth = getDaysInMonth(year, month);
	const firstDay = getFirstDayOfMonth(year, month);
	const cells = Array.from({ length: 42 }, (_, cellIndex) => {
		const dayIndex = cellIndex - firstDay;
		const day = dayIndex >= 0 && dayIndex < daysInMonth ? dayIndex + 1 : null;
		return {
			day,
			key: day
				? toDateString(year, month, day)
				: `empty-${year}-${month}-${cellIndex}`,
		};
	});

	const moveMonth = useCallback((step: number) => {
		setVisibleMonth((current) => {
			const next = new Date(current.year, current.month + step, 1);
			return { year: next.getFullYear(), month: next.getMonth() };
		});
	}, []);

	const handleDayClick = useCallback(
		(dateStr: string) => {
			if (!startDate || (startDate && endDate)) {
				onStartDateChange(dateStr);
				onEndDateChange("");
				return;
			}

			if (dateStr < startDate) {
				onEndDateChange(startDate);
				onStartDateChange(dateStr);
				return;
			}

			onEndDateChange(dateStr);
			setOpen(false);
		},
		[startDate, endDate, onStartDateChange, onEndDateChange],
	);

	const displayLabel =
		startDate || endDate
			? `${startDate ? formatDateShort(startDate) : "..."} - ${
					endDate ? formatDateShort(endDate) : "..."
				}`
			: "Выберите период";

	return (
		<div ref={ref} className="relative shrink-0">
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				className="flex h-12 items-center gap-2 rounded-3xl border border-app-border bg-app-surface px-4 text-sm font-medium text-app-text transition-colors hover:bg-app-surface-hover"
			>
				<CalendarDays size={17} className="text-app-muted" />
				<span className="min-w-[166px] text-left">{displayLabel}</span>
				<ChevronDown
					size={16}
					className={`text-app-muted transition-transform ${
						open ? "rotate-180" : ""
					}`}
				/>
			</button>

			{open && (
				<div
					className="absolute left-0 top-full z-50 mt-2 w-[320px] rounded-3xl border border-app-border p-4 shadow-2xl"
					style={{
						backgroundColor: "var(--color-bg)",
						boxShadow: "0 24px 60px rgba(0, 0, 0, 0.28)",
					}}
				>
					<div className="mb-4 flex items-center justify-between">
						<button
							type="button"
							onClick={() => moveMonth(-1)}
							className="flex h-9 w-9 items-center justify-center rounded-xl text-app-muted transition-colors hover:bg-app-surface-hover hover:text-app-text"
							style={{
								backgroundColor:
									"color-mix(in srgb, var(--color-bg) 88%, var(--color-text) 12%)",
							}}
							title="Предыдущий месяц"
						>
							<ChevronLeft size={16} />
						</button>
						<div className="text-sm font-semibold text-app-text">
							{RU_MONTHS[month]} {year}
						</div>
						<button
							type="button"
							onClick={() => moveMonth(1)}
							className="flex h-9 w-9 items-center justify-center rounded-xl text-app-muted transition-colors hover:bg-app-surface-hover hover:text-app-text"
							style={{
								backgroundColor:
									"color-mix(in srgb, var(--color-bg) 88%, var(--color-text) 12%)",
							}}
							title="Следующий месяц"
						>
							<ChevronRight size={16} />
						</button>
					</div>

					<div className="grid grid-cols-7 gap-1">
						{RU_DAYS_SHORT.map((day) => (
							<div
								key={day}
								className="py-1 text-center text-[11px] font-medium text-app-muted"
							>
								{day}
							</div>
						))}
						{cells.map(({ day, key }) => {
							if (day === null) {
								return <div key={key} className="h-9" />;
							}

							const dateStr = toDateString(year, month, day);
							const isStart = dateStr === startDate;
							const isEnd = dateStr === endDate;
							const inRange =
								Boolean(startDate && endDate) &&
								dateStr > startDate &&
								dateStr < endDate;
							const isToday = dateStr === today;

							return (
								<button
									key={dateStr}
									type="button"
									onClick={() => handleDayClick(dateStr)}
									className={`h-9 rounded-xl text-xs font-semibold transition-colors ${
										isStart || isEnd
											? "bg-brand text-white"
											: inRange
												? "bg-brand/10 text-app-text ring-1 ring-brand/10"
												: "text-app-muted hover:bg-app-surface-hover hover:text-app-text"
									}`}
								>
									<span
										className={
											isToday && !isStart && !isEnd
												? "inline-flex h-6 w-6 items-center justify-center rounded-full border border-brand"
												: ""
										}
									>
										{day}
									</span>
								</button>
							);
						})}
					</div>

					<div className="mt-4 flex items-center justify-between border-t border-app-border pt-3">
						<button
							type="button"
							onClick={() => {
								onStartDateChange("");
								onEndDateChange("");
								setOpen(false);
							}}
							className="text-xs font-medium text-app-muted transition-colors hover:text-app-text"
						>
							Очистить
						</button>
						<button
							type="button"
							onClick={() => {
								if (!startDate) {
									onStartDateChange(today);
								}
								onEndDateChange(today);
								setVisibleMonth(getMonthFromDate(today));
								setOpen(false);
							}}
							className="text-xs font-medium text-brand transition-colors hover:text-app-text"
						>
							Сегодня
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
