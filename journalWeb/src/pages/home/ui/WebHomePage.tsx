import { useHomework } from "@/entities/homework";
import { useUser } from "@/entities/user";
import { BookOpen } from "lucide-react";
import { FutureExams } from "@/widgets/FutureExams/ui/FutureExams";
import { GoalsSummaryCard } from "@/widgets/Goals/GoalsSummaryCard/ui/GoalsSummaryCard";
import { HomeworkCountersBar } from "@/widgets/HomeworkList/ui/shared/HomeworkCounterBar";
import { Leaderboard } from "@/widgets/Leaderboard/ui/Leaderboard";
import { ReviewsList } from "@/widgets/ReviewList/ui/ReviewList";
import { HomeScheduleSection } from "@/widgets/Schedule/HomeScheduleSection/ui/HomeScheduleSection";

/**
 * WebHomePage — десктопная версия главной страницы.
 * MacBook Air 13" (1470×956 logical px).
 *
 * Макет (3 колонки):
 * ┌──────────────┬────────────────┬──────────────┐  высота: 480px
 * │ GoalsSummary │ HomeSchedule   │ Домашка      │
 * │ FutureExams  │                │              │
 * ├──────────────┴────────────────┴──────────────┤  высота: 380px
 * │ Leaderboard          │ Reviews               │
 * └──────────────────────┴───────────────────────┘
 */
export function WebHomePage() {
	const user = useUser();
	const { counters, filterStatus, setFilter } = useHomework();

	return (
		<div className="p-5 pb-8 flex flex-col gap-4 w-full">
			<div
				className="grid gap-4"
				style={{
					gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
					alignItems: "stretch",
				}}
			>
				{/* ── РЯД 1, ЛЕВО (Сводка + Лидеры) ── */}
				<div className="flex flex-col gap-4 min-w-0">
					{/* Сводка */}
					<GoalsSummaryCard />

					{/* Лидеры */}
					<div
						className="rounded-[20px] border border-app-border p-4 flex flex-col flex-1 min-h-0"
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
				</div>

				{/* ── РЯД 1, ПРАВО (Расписание + Домашка) ── */}
				<div className="flex flex-col gap-4 min-w-0">
					{/* Расписание */}
					<div
						className="rounded-[20px] border border-app-border p-4 flex flex-col flex-1 min-h-0"
						style={{
							background: "var(--color-surface)",
							boxShadow: "var(--shadow-card)",
						}}
					>
						<div
							className="overflow-y-auto flex-1 min-h-0 -mx-3 px-3 pt-2 pb-3"
							style={{ scrollbarWidth: "thin" }}
						>
							<HomeScheduleSection />
						</div>
					</div>

					{/* Домашка */}
					<div
						className="rounded-[20px] border border-app-border p-4 flex flex-col shrink-0 min-w-0 overflow-hidden"
						style={{
							background: "var(--color-surface)",
							boxShadow: "var(--shadow-card)",
						}}
					>
						<div className="flex items-center gap-2 mb-4 shrink-0">
							<BookOpen size={15} className="text-app-muted shrink-0" />
							<h2 className="text-sm font-bold text-app-text">Домашка</h2>
						</div>
						<div className="homework-counters-full">
							{counters && (
								<HomeworkCountersBar
									counters={counters}
									activeFilter={filterStatus}
									onFilter={setFilter}
									readonly={true}
									columns={2}
								/>
							)}
						</div>
					</div>
				</div>

				{/* ── РЯД 2, ЛЕВО (Экзамены) ── */}
				<div
					className="rounded-[20px] border border-app-border p-4 flex flex-col h-full min-h-0"
					style={{
						background: "var(--color-surface)",
						boxShadow: "var(--shadow-card)",
						height: "23.75rem",
					}}
				>
					<div className="flex items-center gap-2 mb-3 shrink-0">
						<div className="w-[2px] h-5 bg-app-border rounded-full" />
						<h2 className="text-sm font-bold text-app-text">
							Будущие экзамены
						</h2>
					</div>
					<div
						className="overflow-y-auto flex-1 min-h-0"
						style={{ scrollbarWidth: "thin" }}
					>
						<FutureExams />
					</div>
				</div>

				{/* ── РЯД 2, ПРАВО (Отзывы) ── */}
				<div
					className="rounded-[20px] border border-app-border p-4 flex flex-col h-full min-h-0"
					style={{
						background: "var(--color-surface)",
						boxShadow: "var(--shadow-card)",
						height: "23.75rem",
					}}
				>
					<div
						className="overflow-y-auto flex-1 min-h-0"
						style={{ scrollbarWidth: "thin" }}
					>
						<ReviewsList />
					</div>
				</div>
			</div>
		</div>
	);
}
