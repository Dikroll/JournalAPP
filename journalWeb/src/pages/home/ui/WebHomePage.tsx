import { CalendarCheck } from "lucide-react";
import { useFutureExams } from "@/entities/exam";
import { useGrades } from "@/entities/grades";
import { useHomework } from "@/entities/homework";
import { STATUS_KEY_MAP } from "@/entities/homework/configs/homeworkConfig";
import { useHomeSchedule } from "@/entities/schedule";
import { useUser } from "@/entities/user";
import { ActivityWidget } from "@/widgets/DashboardCharts/ui/ActivityWidget";
import { FutureExams } from "@/widgets/FutureExams/ui/FutureExams";
import { WebGoalsSummaryWidget } from "@/widgets/Goals/GoalsSummaryCard/ui/WebGoalsSummaryWidget";
import { RecentGradesWidget } from "@/widgets/Grades/RecentGradesWidget/ui/RecentGradesWidget";
import { HomeworkUpcomingWidget } from "@/widgets/HomeworkList/ui/HomeworkUpcomingWidget";
import { Leaderboard } from "@/widgets/Leaderboard/ui/Leaderboard";
import { HomeScheduleSection } from "@/widgets/Schedule/HomeScheduleSection/ui/HomeScheduleSection";
import { NextClassWidget } from "@/widgets/Schedule/NextClassWidget/ui/NextClassWidget";

// Хелпер для точного расчета динамических лимитов и высоты колонок
function calculateDynamicLayout(
	lessonsCount: number,
	actualExams: number,
	actualHomeworks: number,
	actualGrades: number,
) {
	const visibleLessons = Math.min(Math.max(lessonsCount, 3), 6);
	const scheduleHeight = 246 + visibleLessons * 76;
	const maxHomeworkRows = visibleLessons >= 5 ? 4 : 3;
	const maxExamRows = visibleLessons >= 5 ? 4 : 3;
	const examsLimit = Math.max(
		3,
		Math.min(maxExamRows, Math.max(actualExams, 3)),
	);
	const homeworkLimit = Math.min(actualHomeworks, maxHomeworkRows);
	let summary: "line" | "cube" = "cube";

	const visibleExamRows = Math.min(actualExams, examsLimit);
	const leftHeightWithCube =
		100 + 170 + visibleExamRows * 68 + homeworkLimit * 68;

	// Расписание задает целевую высоту. Если левая колонка выше него,
	// первым делом переводим сводку из 2x2 в компактную 1x4.
	if (leftHeightWithCube > scheduleHeight) {
		summary = "line";
	}

	const gradesMin = actualGrades > 0 ? Math.min(actualGrades, 3) : 0;
	const rightColumnFixedHeight = 520;
	const rowsNeededForSchedule = Math.ceil(
		Math.max(0, scheduleHeight - rightColumnFixedHeight) / 45,
	);
	const gradesLimit = Math.min(
		actualGrades,
		Math.max(gradesMin, rowsNeededForSchedule),
	);

	return { summary, examsLimit, homeworkLimit, gradesLimit };
}

export function WebHomePage() {
	const user = useUser();
	const { exams } = useFutureExams();
	const { items } = useHomework();
	const { todayLessons, otherLessons } = useHomeSchedule();
	const { entries: gradeEntries } = useGrades();

	const overdueItems = items[STATUS_KEY_MAP.overdue] || [];
	const newItems = items[STATUS_KEY_MAP.new] || [];
	const upcomingHomeworkCount = overdueItems.length + newItems.length;
	const actualGradesCount = gradeEntries.filter(
		(e) => e.marks && Object.values(e.marks).some((mark) => mark !== null),
	).length;

	// Используем расписание на сегодня как базу, чтобы интерфейс не прыгал при переключении дней
	const baseLessonsCount =
		todayLessons.length > 0 ? todayLessons.length : otherLessons.length;

	// Точный расчет подгонки под высоту с помощью хелпера
	const { summary, examsLimit, homeworkLimit, gradesLimit } =
		calculateDynamicLayout(
			baseLessonsCount,
			exams.length,
			upcomingHomeworkCount,
			actualGradesCount,
		);

	return (
		<div className="p-4 xl:p-5 pb-8 w-full min-h-full">
			<div
				className="grid gap-4 w-full max-w-[1280px] mx-auto"
				style={{
					gridTemplateColumns:
						"repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
					alignItems: "stretch",
				}}
			>
				{/* Column 1 */}
				<div className="flex flex-col gap-4 min-w-0 h-full">
					<WebGoalsSummaryWidget variant={summary} />

					<div
						className="rounded-3xl border border-app-border p-4 flex flex-col shrink-0 min-h-0"
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
						<FutureExams limit={examsLimit} />
					</div>

					<HomeworkUpcomingWidget className="flex-1" limit={homeworkLimit} />
				</div>

				{/* Column 2 */}
				<div className="flex flex-col gap-4 min-w-0 h-full">
					<NextClassWidget />

					<div
						className="rounded-3xl border border-app-border p-4 flex flex-col flex-1 min-h-0"
						style={{
							background: "var(--color-surface)",
							boxShadow: "var(--shadow-card)",
						}}
					>
						<div className="-mx-3 px-3 pb-3 flex flex-col flex-1 min-h-0">
							<HomeScheduleSection cardVariant="homeDesktop" lessonLimit={6} />
						</div>
					</div>
				</div>

				{/* Column 3 */}
				<div className="flex flex-col gap-4 min-w-0 h-full">
					<RecentGradesWidget limit={gradesLimit} />

					<ActivityWidget className="flex-1" />

					<div
						className="rounded-3xl border border-app-border p-4 flex flex-col shrink-0 min-h-0"
						style={{
							background: "var(--color-surface)",
							boxShadow: "var(--shadow-card)",
						}}
					>
						<div className="-mx-3 px-3 h-full flex flex-col">
							{user && <Leaderboard myStudentId={user.student_id} />}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
