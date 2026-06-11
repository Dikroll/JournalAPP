import { useLayoutEffect, useRef, useState } from "react";
import type { LessonItem } from "@/entities/schedule";
import { toMinutes } from "@/shared/hooks";

interface TimelineMetrics {
	top: number;
	height: number;
}

export function useTimelineMetrics(
	visibleLessons: LessonItem[],
	sorted: LessonItem[],
	nowMinutes: number,
	isHomeDesktop: boolean,
	showCompletionMarker: boolean,
) {
	const timelineRef = useRef<HTMLDivElement | null>(null);
	const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);
	const [timelineMetrics, setTimelineMetrics] = useState<TimelineMetrics>({
		top: 18,
		height: 0,
	});

	const completionDotIndex = visibleLessons.length;
	const lastVisibleLesson = visibleLessons[visibleLessons.length - 1];

	const activeTimelineDots = sorted.filter(
		(lesson) =>
			nowMinutes >= toMinutes(lesson.started_at) &&
			nowMinutes <= toMinutes(lesson.finished_at),
	).length
		? sorted.findIndex(
				(lesson) =>
					nowMinutes >= toMinutes(lesson.started_at) &&
					nowMinutes <= toMinutes(lesson.finished_at),
			) + 1
		: sorted.filter((lesson) => nowMinutes > toMinutes(lesson.finished_at))
				.length;

	const isCompletionActive = lastVisibleLesson
		? nowMinutes > toMinutes(lastVisibleLesson.finished_at)
		: false;
	const completionColor = isCompletionActive ? "#3B82F6" : "#64748B";

	const activeTimelineMarkers =
		activeTimelineDots + (showCompletionMarker && isCompletionActive ? 1 : 0);
	const timelineMarkerCount =
		visibleLessons.length + (showCompletionMarker ? 1 : 0);

	const timelineFillPercent =
		timelineMarkerCount <= 1
			? activeTimelineMarkers > 0
				? 100
				: 0
			: Math.max(
					0,
					Math.min(
						100,
						((activeTimelineMarkers - 1) / (timelineMarkerCount - 1)) * 100,
					),
				);

	useLayoutEffect(() => {
		if (!isHomeDesktop || visibleLessons.length === 0) return;

		const updateTimelineMetrics = () => {
			const container = timelineRef.current;
			const firstDot = dotRefs.current[0];
			const lastDot =
				dotRefs.current[
					showCompletionMarker ? completionDotIndex : visibleLessons.length - 1
				];
			if (!container || !firstDot || !lastDot) return;

			const containerRect = container.getBoundingClientRect();
			const firstDotRect = firstDot.getBoundingClientRect();
			const lastDotRect = lastDot.getBoundingClientRect();
			const top = firstDotRect.top - containerRect.top;
			const height = Math.max(0, lastDotRect.top - firstDotRect.top);

			setTimelineMetrics((current) =>
				Math.abs(current.top - top) < 0.5 &&
				Math.abs(current.height - height) < 0.5
					? current
					: { top, height },
			);
		};

		updateTimelineMetrics();

		const resizeObserver =
			typeof ResizeObserver !== "undefined"
				? new ResizeObserver(updateTimelineMetrics)
				: null;
		if (timelineRef.current && resizeObserver) {
			resizeObserver.observe(timelineRef.current);
		}
		window.addEventListener("resize", updateTimelineMetrics);

		return () => {
			resizeObserver?.disconnect();
			window.removeEventListener("resize", updateTimelineMetrics);
		};
	}, [completionDotIndex, isHomeDesktop, showCompletionMarker, visibleLessons]);

	return {
		timelineRef,
		dotRefs,
		timelineMetrics,
		timelineFillPercent,
		isCompletionActive,
		completionColor,
		completionDotIndex,
	};
}
