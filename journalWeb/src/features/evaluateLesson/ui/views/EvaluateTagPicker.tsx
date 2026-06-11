import type { FeedbackTag } from "@/entities/feedback";
import { FEEDBACK_TAG_LABELS } from "@/shared/config/feedbackTags";

interface Props {
	tags: FeedbackTag[];
	selected: Set<number>;
	onToggle: (id: number) => void;
	disabled?: boolean;
}

export function EvaluateTagPicker({
	tags,
	selected,
	onToggle,
	disabled = false,
}: Props) {
	return (
		<div className="flex flex-wrap gap-2">
			{tags.map((tag) => {
				const active = selected.has(tag.id);
				return (
					<button
						key={tag.id}
						type="button"
						disabled={disabled}
						onClick={() => onToggle(tag.id)}
						className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
						style={{
							background: active
								? "var(--color-brand-subtle)"
								: "var(--color-surface-strong)",
							border: active
								? "1.5px solid var(--color-brand-border)"
								: "1px solid var(--color-border)",
							color: active ? "var(--color-brand)" : "var(--color-text-muted)",
						}}
					>
						{FEEDBACK_TAG_LABELS[tag.key] ?? tag.key}
					</button>
				);
			})}
		</div>
	);
}
