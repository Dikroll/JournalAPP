import { useEffect, useRef, useState } from "react";
import type { GradeEntryExpanded } from "@/entities/grades";
import { useLazyItems } from "@/shared/hooks";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import {
	formatDateRelative,
	formatWeekLabel,
	getStartOfWeek,
	toDateString,
} from "@/shared/utils";
import { GradeEntryRow } from "./GradeEntryRow";

interface Props {
	byDate: Array<{ date: string; items: GradeEntryExpanded[] }>;
}

function DateCard({
	date,
	items,
}: {
	date: string;
	items: GradeEntryExpanded[];
}) {
	const [visible, setVisible] = useState(false);
	const cardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = cardRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "300px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const estimatedHeight = 56 + items.length * 68;

	return (
		<div className="space-y-2 break-inside-avoid">
			<div className="text-sm font-medium text-app-muted px-1">
				{formatDateRelative(date)}
			</div>
			<div
				ref={cardRef}
				className="bg-app-surface rounded-[24px] p-3 border border-app-border"
				style={{
					boxShadow: "var(--shadow-card)",
					minHeight: visible && items.length > 0 ? undefined : estimatedHeight,
				}}
			>
				{visible && items.length === 0 && (
					<div className="flex items-center justify-center h-full min-h-[56px] text-app-muted text-sm">
						Пар не было
					</div>
				)}
				{visible &&
					items.length > 0 &&
					items.map((entry, idx) => (
						<div
							key={`${entry.date}-${entry.lesson_number}-${entry.spec_id}-${idx}`}
						>
							{idx > 0 && <div className="border-t border-app-border my-1" />}
							<GradeEntryRow entry={entry} />
						</div>
					))}
			</div>
		</div>
	);
}

export function GradesRecentList({ byDate }: Props) {
	const { visibleCount, sentinelRef } = useLazyItems(byDate.length, 20, 15);

	if (byDate.length === 0) {
		return (
			<p className="text-app-muted text-sm text-center py-8">Нет записей</p>
		);
	}

	const visibleDays = byDate.slice(0, visibleCount);
	const isDesktop = useIsDesktop();

	if (!isDesktop) {
		return (
			<div className="space-y-4">
				{visibleDays.map(({ date, items }) => (
					<DateCard key={date} date={date} items={items} />
				))}

				{visibleCount < byDate.length && (
					<div ref={sentinelRef} className="space-y-3 pt-1 break-inside-avoid">
						{[0, 1].map((i) => (
							<div
								key={i}
								className="bg-app-surface rounded-[24px] animate-pulse h-20"
							/>
						))}
					</div>
				)}
			</div>
		);
	}

	const weeksMap = new Map<
		string,
		Array<{ date: string; items: GradeEntryExpanded[] }>
	>();

	visibleDays.forEach((day) => {
		const weekStart = getStartOfWeek(day.date);
		if (!weeksMap.has(weekStart)) {
			weeksMap.set(weekStart, []);
		}
		weeksMap.get(weekStart)?.push(day);
	});

	const weeks = Array.from(weeksMap.entries());

	return (
		<div className="space-y-8">
			{weeks.map(([weekStart, days]) => {
				let displayDays = days;

				if (isDesktop) {
					// Pad to 5 days (Monday to Friday)
					const paddedDays: Array<{
						date: string;
						items: GradeEntryExpanded[];
					}> = [];
					const start = new Date(`${weekStart}T00:00:00`);
					for (let i = 0; i < 5; i++) {
						const d = new Date(start);
						d.setDate(d.getDate() + i);
						const dateStr = toDateString(
							d.getFullYear(),
							d.getMonth(),
							d.getDate(),
						);
						const existingDay = days.find((day) => day.date === dateStr);
						if (existingDay) {
							paddedDays.push(existingDay);
						} else {
							paddedDays.push({ date: dateStr, items: [] });
						}
					}
					displayDays = paddedDays;
				}

				return (
					<div key={weekStart} className="space-y-4">
						<h3 className="text-base font-bold text-app-text px-1">
							{formatWeekLabel(weekStart)}
						</h3>
						<div
							className="flex overflow-x-auto gap-4 items-start pb-4 snap-x snap-mandatory scroll-smooth -mx-4 px-4 md:mx-0 md:px-0"
							style={{ scrollbarWidth: "none" }}
						>
							{displayDays.map(({ date, items }) => (
								<div
									key={date}
									className="shrink-0 w-[85vw] md:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] xl:w-[calc(25%-12px)] 2xl:w-[calc(20%-13px)] snap-start"
								>
									<DateCard date={date} items={items} />
								</div>
							))}
						</div>
					</div>
				);
			})}

			{visibleCount < byDate.length && (
				<div ref={sentinelRef} className="space-y-3 pt-1 break-inside-avoid">
					{[0, 1].map((i) => (
						<div
							key={i}
							className="bg-app-surface rounded-[24px] animate-pulse h-20"
						/>
					))}
				</div>
			)}
		</div>
	);
}
