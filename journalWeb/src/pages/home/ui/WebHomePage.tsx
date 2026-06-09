import { CalendarCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@/entities/user";
import { ActivityWidget } from "@/widgets/DashboardCharts/ui/ActivityWidget";
import { FutureExams } from "@/widgets/FutureExams/ui/FutureExams";
import { WebGoalsSummaryWidget } from "@/widgets/Goals/GoalsSummaryCard/ui/WebGoalsSummaryWidget";
import { RecentGradesWidget } from "@/widgets/Grades/RecentGradesWidget/ui/RecentGradesWidget";
import { HomeworkUpcomingWidget } from "@/widgets/HomeworkList/ui/HomeworkUpcomingWidget";
import { Leaderboard } from "@/widgets/Leaderboard/ui/Leaderboard";
import { HomeScheduleSection } from "@/widgets/Schedule/HomeScheduleSection/ui/HomeScheduleSection";
import { NextClassWidget } from "@/widgets/Schedule/NextClassWidget/ui/NextClassWidget";

function getDashboardDensity() {
	if (typeof window === "undefined") return "roomy";

	const { innerWidth: width, innerHeight: height } = window;
	if (width < 1120 || height < 760) return "compact";
	if (width < 1380 || height < 860) return "cozy";
	return "roomy";
}

function useDashboardDensity() {
	const [density, setDensity] = useState(getDashboardDensity);

	useEffect(() => {
		const onResize = () => setDensity(getDashboardDensity());

		onResize();
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	return density;
}

export function WebHomePage() {
	const user = useUser();
	const density = useDashboardDensity();
	const isCompact = density === "compact";
	const isCozy = density === "cozy";
	const limits = {
		exams: isCompact ? 2 : 3,
		homework: isCompact ? 2 : 3,
		grades: isCompact ? 4 : 5,
		lessons: isCompact ? 4 : isCozy ? 5 : undefined,
	};

	return (
		<div className="p-4 xl:p-5 pb-8 w-full min-h-full">
			<div
				className="grid gap-4 w-full"
				style={{
					gridTemplateColumns:
						"repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
					alignItems: "start",
				}}
			>
				<div className="flex flex-col gap-4 min-w-0">
					<WebGoalsSummaryWidget />

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
						<FutureExams limit={limits.exams} />
					</div>

					<HomeworkUpcomingWidget limit={limits.homework} />
				</div>

				<div className="flex flex-col gap-4 min-w-0">
					<NextClassWidget />

					<div
						className="rounded-[20px] border border-app-border p-4 flex flex-col min-h-0"
						style={{
							background: "var(--color-surface)",
							boxShadow: "var(--shadow-card)",
						}}
					>
						<div className="-mx-3 px-3 pb-3 flex flex-col flex-1 min-h-0">
							<HomeScheduleSection
								cardVariant="homeDesktop"
								lessonLimit={limits.lessons}
							/>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-4 min-w-0">
					<RecentGradesWidget limit={limits.grades} />

					<ActivityWidget />

					<div
						className="rounded-[20px] border border-app-border p-4 flex flex-col shrink-0"
						style={{
							background: "var(--color-surface)",
							boxShadow: "var(--shadow-card)",
						}}
					>
						<div className="-mx-3 px-3">
							{user && <Leaderboard myStudentId={user.student_id} />}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
