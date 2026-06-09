import { ArrowRight, MessageSquare } from "lucide-react";
import { useState } from "react";
import { type ReviewItem, useReviews } from "@/entities/review";
import { formatDate } from "@/shared/utils";

function DesktopReviewCard({ review }: { review: ReviewItem }) {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="grid grid-cols-[200px_1fr] gap-4">
			<div className="flex flex-col gap-1">
				<span className="text-sm font-semibold text-app-text">
					{review.teacher}
				</span>
				<span className="text-xs text-app-muted line-clamp-1">
					{review.specs.join(", ")}
				</span>
				<span className="text-xs text-app-muted">
					{formatDate(review.date)}
				</span>
			</div>
			<div className="flex flex-col gap-2">
				<p
					className={`text-sm text-app-text ${expanded ? "" : "line-clamp-2"}`}
				>
					{review.message}
				</p>
				{!expanded && review.message.length > 100 && (
					<button
						type="button"
						onClick={() => setExpanded(true)}
						className="text-status-comment text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-opacity self-start mt-auto"
					>
						Читать полностью <ArrowRight size={14} />
					</button>
				)}
			</div>
		</div>
	);
}

export function DesktopReviewList() {
	const { reviews, status } = useReviews();
	const [showAll, setShowAll] = useState(false);

	if (status === "loading") {
		return (
			<div
				className="bg-app-surface rounded-[24px] border border-app-border p-5 space-y-4"
				style={{ boxShadow: "var(--shadow-card)" }}
			>
				<div className="h-6 w-48 bg-app-border animate-pulse rounded" />
				{[1, 2, 3].map((i) => (
					<div key={i} className="h-16 bg-app-border animate-pulse rounded" />
				))}
			</div>
		);
	}

	if (status === "error" || reviews.length === 0) return null;

	const displayReviews = showAll ? reviews : reviews.slice(0, 3);

	return (
		<div
			className="bg-app-surface rounded-[24px] border border-app-border p-5"
			style={{ boxShadow: "var(--shadow-card)" }}
		>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-bold text-app-text flex items-center gap-2">
					<MessageSquare size={16} className="text-app-muted" />
					<span>Отзывы преподавателей</span> ({reviews.length})
				</h3>
				{!showAll && reviews.length > 3 && (
					<button
						type="button"
						onClick={() => setShowAll(true)}
						className="text-sm text-app-muted hover:text-app-text transition-colors"
					>
						Все отзывы
					</button>
				)}
				{showAll && (
					<button
						type="button"
						onClick={() => setShowAll(false)}
						className="text-sm text-app-muted hover:text-app-text transition-colors"
					>
						Свернуть
					</button>
				)}
			</div>

			<div
				className={`flex flex-col gap-4 ${showAll ? "max-h-[420px] overflow-y-auto pr-2" : ""}`}
				style={showAll ? { scrollbarWidth: "thin" } : undefined}
			>
				{displayReviews.map((review, index) => (
					<div key={`${review.date}-${review.teacher}`}>
						{index > 0 && <div className="h-px bg-app-border mb-4" />}
						<DesktopReviewCard review={review} />
					</div>
				))}
			</div>
		</div>
	);
}
