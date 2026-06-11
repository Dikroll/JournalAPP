import { ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { gradeColor } from "@/entities/goals";
import { useGrades } from "@/entities/grades";
import { useSubjects } from "@/entities/subject";
import {
	normalizeSubjectName,
	useFutureScheduledSubjects,
} from "@/features/goalForecast/hooks/useScheduledSubjects";

interface SubjectStatsWithAttendance {
	specId: number;
	specName: string;
	averageGrade: number | null;
	attendanceRate: number;
}

interface Props {
	onViewAll: () => void;
	onSubjectClick?: (specId: number) => void;
}

export function DesktopSubjectsWidget({ onViewAll, onSubjectClick }: Props) {
	const { entries } = useGrades();
	const { subjects } = useSubjects();
	const activeSubjectNames = useFutureScheduledSubjects();

	const stats = useMemo(() => {
		const bySpec: Record<number, typeof entries> = {};
		for (const e of entries) {
			if (!bySpec[e.spec_id]) bySpec[e.spec_id] = [];
			bySpec[e.spec_id].push(e);
		}

		const specNameById = new Map<number, string>(
			subjects.map((s) => [s.id, s.name]),
		);

		const result: SubjectStatsWithAttendance[] = [];

		for (const specId in bySpec) {
			const items = bySpec[specId];
			const specName =
				specNameById.get(Number(specId)) ??
				items[0]?.spec_name ??
				`Предмет ${specId}`;

			if (
				activeSubjectNames.size > 0 &&
				!activeSubjectNames.has(normalizeSubjectName(specName))
			) {
				continue;
			}

			let totalMarksValue = 0;
			let totalMarksCount = 0;
			let absences = 0;
			const totalClasses = items.length;

			let hasRecent = false;
			const thresholdDate = new Date();
			thresholdDate.setDate(thresholdDate.getDate() - 45);
			const thresholdStr = thresholdDate.toISOString().split("T")[0];

			for (const e of items) {
				if (e.marks) {
					for (const v of Object.values(e.marks)) {
						if (typeof v === "number" && v > 0) {
							totalMarksValue += v;
							totalMarksCount++;
						}
					}
				}
				if (e.attended === "absent") {
					absences++;
				}
				if (e.date >= thresholdStr) {
					hasRecent = true;
				}
			}

			if (!hasRecent) continue;

			const averageGrade =
				totalMarksCount > 0 ? totalMarksValue / totalMarksCount : null;
			const attendanceRate =
				totalClasses > 0 ? ((totalClasses - absences) / totalClasses) * 100 : 0;

			if (averageGrade !== null || totalClasses > 0) {
				result.push({
					specId: Number(specId),
					specName,
					averageGrade,
					attendanceRate,
				});
			}
		}

		return result
			.sort((a, b) => {
				if (a.averageGrade !== b.averageGrade) {
					return (b.averageGrade ?? 0) - (a.averageGrade ?? 0);
				}
				return a.specName.localeCompare(b.specName, "ru");
			})
			.slice(0, 4);
	}, [entries, subjects, activeSubjectNames]);

	if (stats.length === 0) return null;

	return (
		<div
			className="w-full text-left rounded-[22px] p-4 bg-app-surface border border-app-border flex flex-col"
			style={{ boxShadow: "var(--shadow-card)" }}
		>
			<h3 className="text-[15px] font-bold text-app-text mb-4">По предметам</h3>

			<div className="space-y-4">
				{stats.map((s) => {
					const avgDisplay = s.averageGrade ? s.averageGrade.toFixed(1) : "—";
					const color = s.averageGrade
						? gradeColor(s.averageGrade)
						: "var(--color-text-muted)";

					return (
						<button
							type="button"
							key={s.specId}
							onClick={() => onSubjectClick?.(s.specId)}
							className="group w-full text-left block active:scale-[0.99] transition-transform"
						>
							<div className="flex items-center justify-between gap-2 mb-1.5">
								<span className="text-[13px] font-medium text-app-text truncate flex-1">
									{s.specName}
								</span>
								<div className="flex items-center gap-1 shrink-0">
									<span className="text-[16px] font-bold" style={{ color }}>
										{avgDisplay}
									</span>
									<ChevronRight size={16} className="text-app-muted" />
								</div>
							</div>

							<div className="h-[4px] w-full rounded-full bg-app-surface-strong overflow-hidden mb-1.5">
								<div
									className="h-full rounded-full transition-all"
									style={{ width: `${s.attendanceRate}%`, background: color }}
								/>
							</div>

							<div className="text-[11px] text-app-muted text-right">
								Посещаемость: {Math.round(s.attendanceRate)}%
							</div>
						</button>
					);
				})}
			</div>

			<button
				type="button"
				onClick={onViewAll}
				className="mt-5 w-full py-2.5 rounded-[12px] bg-app-surface-strong text-[13px] font-medium text-app-text active:scale-[0.98] transition-transform hover:brightness-110"
			>
				Все предметы
			</button>
		</div>
	);
}
