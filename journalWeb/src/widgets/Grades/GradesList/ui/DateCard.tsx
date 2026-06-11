import { useEffect, useRef, useState } from "react";
import { isWebPlatform } from "@/shared/lib/platform";
import { formatDateRelative } from "@/shared/utils";
import type { DisplayItem } from "../lib/displayDaysFormatter";
import { GradeEntryRow } from "./GradeEntryRow";
import { PendingLessonRow } from "./PendingLessonRow";

interface Props {
	date: string;
	items: DisplayItem[];
}

export function DateCard({ date, items }: Props) {
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

	const isWeb = isWebPlatform;

	const estimatedHeight = 56 + items.length * 68;

	return (
		<div className="space-y-2 break-inside-avoid mb-4">
			<div className="text-sm font-medium text-app-muted px-1">
				{formatDateRelative(date)}
			</div>
			<div
				ref={cardRef}
				className={`bg-app-surface ${isWeb ? "rounded-3xl" : "rounded-3xl"} p-3 border border-app-border`}
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
					items.map((item, idx) => (
						<div
							key={
								item.type === "grade"
									? `${item.entry.date}-${item.entry.lesson_number}-${item.entry.spec_id}-${idx}`
									: `${item.lesson.date}-${item.lesson.lesson}-${item.lesson.subject}-${idx}`
							}
						>
							{idx > 0 && <div className="border-t border-app-border my-1" />}
							{item.type === "grade" ? (
								<GradeEntryRow entry={item.entry} />
							) : (
								<PendingLessonRow lesson={item.lesson} />
							)}
						</div>
					))}
			</div>
		</div>
	);
}
