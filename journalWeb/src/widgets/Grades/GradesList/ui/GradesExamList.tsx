import { CheckCircle, Clock, GraduationCap, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { ExamResult } from "@/entities/exam";
import { useExamResults } from "@/entities/exam";
import { useLazyItems } from "@/shared/hooks";
import { ErrorView, SkeletonList } from "@/shared/ui";
import { formatDate } from "@/shared/utils";

function getMarkColor(mark: number): string {
	if (mark >= 4)
		return "text-status-checked bg-checked-subtle border-status-checked/30";
	if (mark === 3)
		return "text-status-pending bg-pending-subtle border-status-pending/30";
	if (mark > 0)
		return "text-status-overdue bg-overdue-bg border-status-overdue/30";
	return "text-app-muted bg-app-surface-strong border-app-border";
}

function ExamRow({ exam }: { exam: ExamResult }) {
	const isPassed = exam.mark > 0;

	return (
		<div
			className="grid gap-2.5 py-2"
			style={{ gridTemplateColumns: "1fr auto" }}
		>
			<div className="min-w-0">
				<h4 className="text-sm font-semibold text-app-text leading-snug line-clamp-2">
					{exam.spec}
				</h4>

				{exam.teacher && (
					<div className="flex items-center gap-1.5 mt-1">
						<GraduationCap size={13} className="text-app-text flex-shrink-0" />
						<p className="text-xs text-app-muted leading-snug">
							{exam.teacher}
						</p>
					</div>
				)}

				{isPassed && exam.date && (
					<div className="flex items-center gap-1 mt-1">
						<CheckCircle
							size={11}
							className="text-status-checked flex-shrink-0"
						/>

						<span className="text-xs text-status-checked">
							{formatDate(exam.date)}
						</span>
					</div>
				)}

				{exam.comment && (
					<p className="text-xs text-app-muted mt-0.5 line-clamp-1">
						{exam.comment}
					</p>
				)}
			</div>

			{isPassed ? (
				<div
					className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border flex-shrink-0 ${getMarkColor(
						exam.mark,
					)}`}
				>
					{exam.mark}
				</div>
			) : (
				<div className="w-10 h-10 rounded-xl flex items-center justify-center bg-app-surface-strong border border-app-border flex-shrink-0">
					<Clock size={16} className="text-app-muted" />
				</div>
			)}
		</div>
	);
}

interface GradesExamListProps {
	selectedGrade?: string;
	gradeFilter?: ReactNode;
}

export function GradesExamList({
	selectedGrade = "all",
	gradeFilter,
}: GradesExamListProps) {
	const { exams, status } = useExamResults();
	const [query, setQuery] = useState("");

	const filteredExams = useMemo(() => {
		const normalized = query.trim().toLocaleLowerCase("ru-RU");
		const gradeFiltered =
			selectedGrade === "all"
				? exams
				: exams.filter((exam) => String(exam.mark) === selectedGrade);

		if (!normalized) return gradeFiltered;

		return gradeFiltered.filter((exam) =>
			[exam.spec, exam.teacher, exam.comment, exam.date]
				.filter(Boolean)
				.some((value) =>
					String(value).toLocaleLowerCase("ru-RU").includes(normalized),
				),
		);
	}, [exams, query, selectedGrade]);

	const passed = filteredExams.filter((e) => e.mark > 0);
	const pending = filteredExams.filter((e) => e.mark === 0);
	const hasFilteredResults = passed.length > 0 || pending.length > 0;

	if (status === "loading") return <SkeletonList count={3} height={72} />;

	if (status === "error") {
		return <ErrorView message="Не удалось загрузить экзамены" />;
	}

	if (exams.length === 0) {
		return (
			<p className="text-app-muted text-sm text-center py-8">Нет экзаменов</p>
		);
	}

	const Section = ({
		title,
		items,
		scrollable,
	}: {
		title: string;
		items: ExamResult[];
		scrollable?: boolean;
	}) => {
		const { visibleCount, sentinelRef } = useLazyItems(items.length, 5, 5);
		const visibleItems = scrollable ? items : items.slice(0, visibleCount);

		if (!items.length) return null;
		return (
			<div
				className={
					scrollable
						? "space-y-2 md:flex md:h-[calc(100vh-16rem)] md:min-h-0 md:flex-col"
						: "space-y-2"
				}
			>
				<p className="text-sm font-medium text-app-muted px-1">{title}</p>
				<div
					className={`bg-app-surface rounded-[24px] md:rounded-2xl p-3 border border-app-border ${
						scrollable ? "md:flex md:min-h-0 md:flex-1 md:flex-col" : ""
					}`}
					style={{ boxShadow: "var(--shadow-card)" }}
				>
					<div
						className={
							scrollable
								? "md:flex-1 md:min-h-0 md:overflow-y-auto md:pr-1"
								: ""
						}
						style={scrollable ? { scrollbarWidth: "thin" } : undefined}
					>
						{visibleItems.map((exam, idx) => (
							<div key={exam.exam_id}>
								{idx > 0 && <div className="border-t border-app-border my-1" />}
								<ExamRow exam={exam} />
							</div>
						))}
						{!scrollable && <div ref={sentinelRef} />}
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="space-y-4">
			<div className="flex w-full items-center gap-3">
				<label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-2xl border border-app-border bg-app-surface px-3 text-app-muted">
					<Search size={15} className="shrink-0" />
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Поиск по экзамену"
						className="min-w-0 flex-1 bg-transparent text-sm text-app-text placeholder:text-app-muted"
					/>
				</label>
				{gradeFilter}
			</div>

			{hasFilteredResults ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Section title="Сданные" items={passed} scrollable />
					<Section title="Не сданные" items={pending} />
				</div>
			) : (
				<p className="text-app-muted text-sm text-center py-8">
					Экзамены не найдены
				</p>
			)}
		</div>
	);
}
