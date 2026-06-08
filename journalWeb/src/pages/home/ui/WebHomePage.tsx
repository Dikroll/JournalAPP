import { CalendarCheck } from "lucide-react";
import { useUser } from "@/entities/user";
import { ActivityWidget } from "@/widgets/DashboardCharts/ui/ActivityWidget";
import { FutureExams } from "@/widgets/FutureExams/ui/FutureExams";
import { GoalsSummaryCard } from "@/widgets/Goals/GoalsSummaryCard/ui/GoalsSummaryCard";
import { RecentGradesWidget } from "@/widgets/Grades/RecentGradesWidget/ui/RecentGradesWidget";
import { HomeworkUpcomingWidget } from "@/widgets/HomeworkList/ui/HomeworkUpcomingWidget";
import { Leaderboard } from "@/widgets/Leaderboard/ui/Leaderboard";
import { HomeScheduleSection } from "@/widgets/Schedule/HomeScheduleSection/ui/HomeScheduleSection";
import { NextClassWidget } from "@/widgets/Schedule/NextClassWidget/ui/NextClassWidget";

/**
 * WebHomePage — десктопная версия главной страницы.
 * 3-колоночный макет.
 */
export function WebHomePage() {
	const user = useUser();

	return (
		<div className="p-5 pb-8 flex flex-col gap-4 w-full h-full min-h-0 overflow-hidden">
			{/* ОСНОВНАЯ СЕТКА: 3 колонки */}
			<div
				className="grid gap-4 flex-1 min-h-0"
				style={{
					gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
					alignItems: "stretch",
				}}
			>
				{/* ── КОЛОНКА 1 (Планирование) ── */}
				<div className="flex flex-col gap-4 min-w-0 h-full min-h-0 overflow-hidden">
					{/* Сводка */}
					<GoalsSummaryCard />

					{/* Экзамены (без скролла) */}
					<div
						className="rounded-[20px] border border-app-border p-4 flex flex-col shrink-0"
						style={{
							background: "var(--color-surface)",
							boxShadow: "var(--shadow-card)",
						}}
					>
						<div className="flex items-center gap-2 mb-3 shrink-0">
							<CalendarCheck size={16} className="text-app-muted shrink-0" />
							<h2 className="text-sm font-bold text-app-text">
								Будущие экзамены
							</h2>
						</div>
						<FutureExams limit={3} />
					</div>

					{/* Домашка (тянется, чтобы закрыть дыру, внутри будет красивое заполнение) */}
					<HomeworkUpcomingWidget className="flex-1 min-h-0 overflow-hidden" />
				</div>

				{/* ── КОЛОНКА 2 (Расписание) ── */}
				<div className="flex flex-col gap-4 min-w-0 h-full min-h-0 overflow-hidden">
					{/* Следующая пара */}
					<NextClassWidget />

					{/* Расписание (без скролла, тянется чтобы закрыть дыру снизу) */}
					<div
						className="rounded-[20px] border border-app-border p-4 flex flex-col flex-1 min-h-0 overflow-hidden"
						style={{
							background: "var(--color-surface)",
							boxShadow: "var(--shadow-card)",
						}}
					>
						<div className="-mx-3 px-3 pt-2 pb-3 flex flex-col flex-1 min-h-0">
							<HomeScheduleSection cardVariant="homeDesktop" />
						</div>
					</div>
				</div>

				{/* ── КОЛОНКА 3 (Результаты) ── */}
				<div className="flex flex-col gap-4 min-w-0 h-full min-h-0 overflow-hidden">
					{/* Последние оценки */}
					<RecentGradesWidget />

					{/* Активность (График красиво тянется по высоте!) */}
					<ActivityWidget className="flex-1 min-h-0" />

					{/* Лидеры (Схлопывается по контенту, чтобы не было дыры снизу) */}
					<div
						className="rounded-[20px] border border-app-border p-4 flex flex-col shrink-0"
						style={{
							background: "var(--color-surface)",
							boxShadow: "var(--shadow-card)",
						}}
					>
						<div
							className="overflow-y-auto shrink-0 -mx-3 px-3"
							style={{ scrollbarWidth: "thin" }}
						>
							{user && <Leaderboard myStudentId={user.student_id} />}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
