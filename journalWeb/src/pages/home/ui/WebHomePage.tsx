import { CalendarCheck } from "lucide-react";
import { useUser } from "@/entities/user";
import { useFutureExams } from "@/entities/exam";
import { useGrades } from "@/entities/grades";
import { useHomework } from "@/entities/homework";
import { STATUS_KEY_MAP } from "@/entities/homework/configs/homeworkConfig";
import { useHomeSchedule } from "@/entities/schedule";
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
	actualGrades: number
) {
	let gradesLimit = 3;
	let examsLimit = 3;
	let homeworkLimit = 3;
	let summary: "line" | "cube" = "cube";

	if (lessonsCount >= 6) {
		gradesLimit = 6;
		examsLimit = 4;
		homeworkLimit = 5;
	} else if (lessonsCount >= 4) {
		gradesLimit = 5;
		examsLimit = 3;
		homeworkLimit = 4;
	}

	// Мы не можем показать больше оценок, чем их есть на самом деле
	gradesLimit = Math.min(gradesLimit, actualGrades);

	const middleHeight = 246 + lessonsCount * 76;
	const rightHeight = 512 + gradesLimit * 45;
	const maxOtherHeight = Math.max(middleHeight, rightHeight);

	// Приблизительная высота левой колонки с базовыми лимитами (ограниченными реальными данными)
	let e = Math.min(examsLimit, actualExams);
	let h = Math.min(homeworkLimit, actualHomeworks);
	const expectedLeftItemsHeight = 100 + e * 68 + h * 68;

	// Агрессивно ужимаем сводку в линию, если левая колонка начинает растягивать строку
	if (expectedLeftItemsHeight + 170 > maxOtherHeight) {
		summary = "line";
	}

	// Если мы ужали сводку (или если просто есть место), попытаемся забить это место полезным контентом!
	const leftBase = 100 + (summary === "cube" ? 170 : 90);
	
	// Докидываем домашку, пока она влезает в высоту (даем допуск 20px, чтобы заполнить почти впритык)
	while (leftBase + e * 68 + (h + 1) * 68 <= maxOtherHeight + 20 && h < actualHomeworks) {
		h++;
	}
	// Докидываем экзамены, если еще есть место
	while (leftBase + (e + 1) * 68 + h * 68 <= maxOtherHeight + 20 && e < actualExams) {
		e++;
	}

	examsLimit = Math.max(examsLimit, e);
	homeworkLimit = Math.max(homeworkLimit, h);

	// Отдаем неиспользованные слоты экзаменов домашке
	const unusedExams = Math.max(0, examsLimit - actualExams);
	homeworkLimit += unusedExams;

	return { summary, examsLimit, homeworkLimit, gradesLimit };
}

export function WebHomePage() {
	const user = useUser();
	const { exams } = useFutureExams();
	const { items } = useHomework();
	const { todayLessons, otherLessons, offset } = useHomeSchedule();
	const { entries: gradeEntries } = useGrades();

	const overdueItems = items[STATUS_KEY_MAP.overdue] || [];
	const newItems = items[STATUS_KEY_MAP.new] || [];
	const upcomingHomeworkCount = overdueItems.length + newItems.length;
	const actualGradesCount = gradeEntries.filter((e) => e.marks && Object.values(e.marks).length > 0).length;

	// Используем расписание на сегодня как базу, чтобы интерфейс не прыгал при переключении дней
	const baseLessonsCount = todayLessons.length > 0 ? todayLessons.length : otherLessons.length;

	// Точный расчет подгонки под высоту с помощью хелпера
	const { summary, examsLimit, homeworkLimit, gradesLimit } = calculateDynamicLayout(
		baseLessonsCount,
		exams.length,
		upcomingHomeworkCount,
		actualGradesCount
	);

	return (
		<div className="p-4 xl:p-5 pb-8 w-full min-h-full">
			<div
				className="grid gap-4 w-full"
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
						className="rounded-[20px] border border-app-border p-4 flex flex-col flex-1 shrink-0 min-h-0"
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
						className="rounded-[20px] border border-app-border p-4 flex flex-col flex-1 min-h-0"
						style={{
							background: "var(--color-surface)",
							boxShadow: "var(--shadow-card)",
						}}
					>
						<div className="-mx-3 px-3 pb-3 flex flex-col flex-1 min-h-0">
							<HomeScheduleSection
								cardVariant="homeDesktop"
								lessonLimit={6}
							/>
						</div>
					</div>
				</div>

				{/* Column 3 */}
				<div className="flex flex-col gap-4 min-w-0 h-full">
					<RecentGradesWidget className="flex-1" limit={gradesLimit} />

					<ActivityWidget />

					<div
						className="rounded-[20px] border border-app-border p-4 flex flex-col shrink-0 min-h-0"
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
