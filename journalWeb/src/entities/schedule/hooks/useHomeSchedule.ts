import { useCallback, useEffect, useRef, useState } from "react";
import { useCurrentMinutes } from "@/shared/hooks";
import { toDateString } from "@/shared/utils";
import { getScheduleTimeInfo } from "../lib/scheduleTime";
import { useScheduleByDate } from "./useScheduleByDate";
import { useScheduleToday } from "./useScheduleToday";

export type HomeScheduleOffset = -1 | 0 | 1;

function getDateByOffset(offset: number): string {
	const d = new Date();
	d.setDate(d.getDate() + offset);
	return toDateString(d.getFullYear(), d.getMonth(), d.getDate());
}

function getTitle(offset: number): string {
	switch (offset) {
		case -1:
			return "Расписание на вчера";
		case 0:
			return "Расписание на сегодня";
		case 1:
			return "Расписание на завтра";
		default:
			return "Расписание";
	}
}

export function useHomeSchedule() {
	const { today, status: todayStatus } = useScheduleToday();
	const nowMinutes = useCurrentMinutes();
	const [offset, setOffset] = useState<HomeScheduleOffset>(0);
	const autoShiftedRef = useRef(false);

	const dateStr = getDateByOffset(offset);
	const title = getTitle(offset);

	const sortedToday = [...today].sort((a, b) => a.lesson - b.lesson);
	const todayTimeInfo =
		todayStatus === "success"
			? getScheduleTimeInfo(sortedToday, nowMinutes)
			: null;
	const shouldAutoShowTomorrow =
		todayStatus === "success" &&
		(today.length === 0 || todayTimeInfo?.type === "after-lessons");

	const yesterdayStr = getDateByOffset(-1);
	const tomorrowStr = getDateByOffset(1);
	const { lessons: yesterdayLessons, status: yesterdayStatus } =
		useScheduleByDate(offset === -1 ? yesterdayStr : null);
	const { lessons: tomorrowLessons, status: tomorrowStatus } =
		useScheduleByDate(
			offset === 1 || shouldAutoShowTomorrow ? tomorrowStr : null,
		);

	const otherLessons =
		offset === -1 ? yesterdayLessons : offset === 1 ? tomorrowLessons : [];
	const otherStatus =
		offset === -1 ? yesterdayStatus : offset === 1 ? tomorrowStatus : "idle";

	useEffect(() => {
		if (autoShiftedRef.current) return;
		if (!shouldAutoShowTomorrow) return;

		setOffset(1);
		autoShiftedRef.current = true;
	}, [shouldAutoShowTomorrow]);

	const goPrev = useCallback(
		() => setOffset((o) => Math.max(o - 1, -1) as HomeScheduleOffset),
		[],
	);
	const goNext = useCallback(
		() => setOffset((o) => Math.min(o + 1, 1) as HomeScheduleOffset),
		[],
	);
	const goToday = useCallback(() => setOffset(0), []);

	return {
		offset,
		dateStr,
		title,
		todayLessons: today,
		todayStatus,
		otherLessons,
		otherStatus,
		goPrev,
		goNext,
		goToday,
	};
}
