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
		<div className="p-5 pb-8 flex flex-col gap-4 w-full">
			{/* ОСНОВНАЯ СЕТКА: 3 колонки */}
			<div
				className="grid gap-4"
				style={{
					gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
					alignItems: "start",
				}}
			>
				{/* ── КОЛОНКА 1 ── */}
				<div className="flex flex-col gap-4 min-w-0">
					{/* Сводка / Профиль */}
					<GoalsSummaryCard />

					{/* Лидеры */}
					<div
						className="rounded-[20px] border border-app-border p-4 flex flex-col min-h-0"
						style={{
							background: "var(--color-surface)",
							boxShadow: "var(--shadow-card)",
							minHeight: "16.25rem",
						}}
					>
						<div
							className="overflow-y-auto flex-1 min-h-0"
							style={{ scrollbarWidth: "thin" }}
						>
							{user && <Leaderboard myStudentId={user.student_id} />}
						</div>
					</div>

					{/* Домашка */}
					<HomeworkUpcomingWidget />
				</div>

				{/* ── КОЛОНКА 2 ── */}
				<div className="flex flex-col gap-4 min-w-0">
					{/* Следующая пара */}
					<NextClassWidget />

					{/* Последние оценки */}
					<RecentGradesWidget />

					{/* Активность за неделю */}
					<ActivityWidget />
				</div>

				{/* ── КОЛОНКА 3 ── */}
				<div className="flex flex-col gap-4 min-w-0">
					{/* Расписание */}
					<div
						className="rounded-[20px] border border-app-border p-4 flex flex-col min-h-0"
						style={{
							background: "var(--color-surface)",
							boxShadow: "var(--shadow-card)",
						}}
					>
						<div
							className="overflow-y-auto flex-1 min-h-0 -mx-3 px-3 pt-2 pb-3"
							style={{ scrollbarWidth: "thin" }}
						>
							<HomeScheduleSection cardVariant="homeDesktop" />
						</div>
					</div>

					{/* Экзамены */}
					<div
						className="rounded-[20px] border border-app-border p-4 flex flex-col min-h-0"
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
						<div
							className="overflow-y-auto flex-1 min-h-0"
							style={{ scrollbarWidth: "thin" }}
						>
							<FutureExams limit={3} />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
