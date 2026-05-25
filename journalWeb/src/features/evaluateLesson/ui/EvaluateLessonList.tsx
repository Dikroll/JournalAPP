import { ClipboardCheck } from "lucide-react";
import { useState } from "react";
import type { PendingFeedback } from "@/entities/feedback";
import { useFeedback } from "@/entities/feedback";
import { SkeletonList } from "@/shared/ui";
import { EvaluateLessonSheet } from "./EvaluateLessonSheet";
import { PendingFeedbackCard } from "./PendingFeedbackCard";

export function EvaluateLessonList() {
	const { pending, pendingStatus, tags, refreshPending } = useFeedback();
	const [active, setActive] = useState<PendingFeedback | null>(null);

	if (pendingStatus === "loading" && pending.length === 0) {
		return <SkeletonList count={2} height={72} />;
	}

	if (pendingStatus === "error" && pending.length === 0) {
		return (
			<p className="text-status-overdue text-sm text-center py-6">
				Не удалось загрузить список занятий
			</p>
		);
	}

	if (pending.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 gap-3">
				<div
					className="w-16 h-16 rounded-[20px] flex items-center justify-center"
					style={{
						background: "var(--color-surface-strong)",
						border: "1px solid var(--color-border)",
					}}
				>
					<ClipboardCheck size={24} className="text-app-muted" />
				</div>
				<p className="text-base font-semibold text-app-text">
					Все занятия оценены
				</p>
				<p className="text-sm text-app-muted text-center px-8">
					Новые занятия для оценки появятся здесь
				</p>
				<button
					type="button"
					onClick={refreshPending}
					className="mt-2 px-4 py-2 bg-app-surface text-brand text-sm font-semibold rounded-xl border border-app-border active:opacity-70 transition-opacity"
				>
					Обновить
				</button>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-3">
				{pending.map((item) => (
					<PendingFeedbackCard
						key={item.key}
						item={item}
						onEvaluate={() => setActive(item)}
					/>
				))}
			</div>

			{active && (
				<EvaluateLessonSheet
					item={active}
					tags={tags}
					onClose={() => setActive(null)}
				/>
			)}
		</>
	);
}
