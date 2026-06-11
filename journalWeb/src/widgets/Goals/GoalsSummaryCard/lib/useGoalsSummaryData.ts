import { useMemo } from "react";
import { lastValue, useDashboardCharts } from "@/entities/dashboard";
import { useGrades } from "@/entities/grades";
import { useOverallSummary } from "@/features/goalForecast";
import type { Mark } from "@/shared/config";

export function useGoalsSummaryData() {
	const { progress, attendance } = useDashboardCharts({});
	const { entries } = useGrades();
	const summary = useOverallSummary();

	const avg = lastValue(progress);
	const att = lastValue(attendance);

	const distribution = useMemo(() => {
		const counts: Record<Mark, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
		for (const e of entries) {
			if (!e.marks) continue;
			for (const v of Object.values(e.marks)) {
				if (typeof v === "number" && v >= 1 && v <= 5) {
					counts[v as Mark] += 1;
				}
			}
		}
		return counts;
	}, [entries]);

	const totalMarks =
		distribution[1] +
		distribution[2] +
		distribution[3] +
		distribution[4] +
		distribution[5];

	const badgeRisk =
		summary.totalSubjectsWithGoals === 0 ? "no_goal" : summary.risk;

	const pickBadgeLabel = () => {
		if (summary.totalSubjectsWithGoals === 0) return "поставь цели";
		if (summary.risk === "danger" || summary.risk === "watch")
			return `${summary.atRiskCount} в риске`;
		return "цели в норме";
	};

	return {
		avg,
		att,
		distribution,
		totalMarks,
		badgeRisk,
		badgeLabel: pickBadgeLabel(),
		summary,
	};
}
