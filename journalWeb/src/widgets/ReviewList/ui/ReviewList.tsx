import { MessageSquare } from "lucide-react";
import { useReviews } from "@/entities/review";
import { useExpandableList } from "@/shared/hooks";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { ReviewCard } from "./ReviewCard";
import { DesktopReviewList } from "./DesktopReviewList";

export function ReviewsList() {
	const isDesktop = useIsDesktop();
	
	if (isDesktop) {
		return <DesktopReviewList />;
	}

	const initialShow = 3;
	const { reviews, status } = useReviews();
	const { visible, expanded, toggleExpanded, canExpand, remaining } =
		useExpandableList(reviews, initialShow);

	if (status === "loading") {
		return (
			<div className="space-y-3">
				{[1, 2].map((i) => (
					<div
						key={i}
						className="bg-app-surface rounded-[20px] h-24 animate-pulse border border-app-border"
					/>
				))}
			</div>
		);
	}

	if (status === "error" || reviews.length === 0) return null;

	return (
		<div className="bg-app-surface rounded-[20px] p-4 border border-app-border" style={{ boxShadow: "var(--shadow-card)" }}>
			<h3 className="text-app-text text-sm font-bold flex items-center gap-2 mb-4">
				<MessageSquare size={16} className="text-app-muted shrink-0" />
				<span>Отзывы преподавателей</span>
			</h3>

			<div>
				<div className="flex flex-col gap-3 min-h-max">
					{visible.map((review) => (
						<ReviewCard
							key={`${review.date}-${review.teacher}`}
							review={review}
						/>
					))}
					{canExpand && (
						<button
							onClick={(e) => {
								e.preventDefault();
								toggleExpanded();
							}}
							className="w-full py-3 rounded-[18px] bg-app-surface border border-app-border text-app-muted text-sm font-medium hover:bg-app-surface-hover shrink-0"
						>
							{expanded ? "Свернуть" : `Показать ещё ${remaining}`}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
