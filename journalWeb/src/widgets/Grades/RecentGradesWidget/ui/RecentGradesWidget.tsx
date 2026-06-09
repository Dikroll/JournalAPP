import { BookMarked } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getGradeStyle, useGrades } from "@/entities/grades";
import { formatDateRelative } from "@/shared/utils";

export function RecentGradesWidget({ limit = 5 }: { limit?: number }) {
	const { entries } = useGrades();
	const navigate = useNavigate();

	const recentGrades = entries
		.filter((e) => e.marks && Object.values(e.marks).some((v) => v !== null))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
		.slice(0, limit);

	if (recentGrades.length === 0) {
		return (
			<div
				className="rounded-[20px] border border-app-border p-4 flex flex-col min-h-0"
				style={{
					background: "var(--color-surface)",
					boxShadow: "var(--shadow-card)",
				}}
			>
				<div className="flex items-center justify-between mb-3 shrink-0">
					<h2 className="text-sm font-bold text-app-text flex items-center gap-2">
						<BookMarked size={16} className="text-app-muted shrink-0" />
						<span>Последние оценки</span>
					</h2>
					<button
						type="button"
						onClick={() => navigate("/grades")}
						className="text-xs font-semibold text-app-muted bg-app-surface-strong border border-app-border hover:bg-app-surface-active hover:text-app-text hover:border-app-border-strong active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/30 px-3 py-1.5 rounded-xl transition-all"
					>
						Все оценки
					</button>
				</div>
				<div className="text-app-muted text-sm py-4 text-center">
					Оценок пока нет
				</div>
			</div>
		);
	}

	return (
		<div
			className="rounded-[20px] border border-app-border p-4 flex flex-col min-h-0"
			style={{
				background: "var(--color-surface)",
				boxShadow: "var(--shadow-card)",
			}}
		>
			<div className="flex items-center justify-between mb-3 shrink-0">
				<h2 className="text-sm font-bold text-app-text flex items-center gap-2">
					<BookMarked size={16} className="text-app-muted shrink-0" />
					<span>Последние оценки</span>
				</h2>
				<button
					type="button"
					onClick={() => navigate("/grades")}
					className="text-xs font-semibold text-app-muted bg-app-surface-strong border border-app-border hover:bg-app-surface-active hover:text-app-text hover:border-app-border-strong active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/30 px-3 py-1.5 rounded-xl transition-all"
				>
					Все оценки
				</button>
			</div>

			<div className="flex flex-col gap-2">
				{recentGrades.map((entry, idx) => {
					// We take the first non-null mark for simplicity
					const markValue = entry.marks
						? Object.values(entry.marks).find((v) => v !== null)
						: null;

					return (
						<div
							key={`${entry.date}-${entry.lesson_number}-${idx}`}
							className="flex items-center justify-between py-1 border-b border-app-border last:border-0"
						>
							<div className="flex flex-col min-w-0 pr-3">
								<span className="text-xs font-medium text-app-text truncate">
									{entry.spec_name}
								</span>
								<span className="text-[11px] text-app-muted">
									{formatDateRelative(entry.date)}
								</span>
							</div>
							{markValue !== null && (
								<div
									className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border flex-shrink-0"
									style={getGradeStyle(markValue)}
								>
									{markValue}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
