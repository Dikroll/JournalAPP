import type { NoteStatus } from "@/entities/schedule";

interface Props {
	statuses: NoteStatus[];
	selected: NoteStatus;
	onSelect: (s: NoteStatus) => void;
}

export function StatusPicker({ statuses, selected, onSelect }: Props) {
	return (
		<div className="flex flex-wrap gap-2">
			{statuses.map((status) => {
				const active = selected.label === status.label;
				return (
					<button
						key={status.label}
						type="button"
						onClick={() => onSelect(status)}
						className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
						style={{
							background: active
								? `${status.color}15`
								: "var(--color-surface-strong)",
							border: active
								? `1.5px solid ${status.color}40`
								: "1px solid var(--color-border)",
							color: active ? status.color : "var(--color-text-muted)",
						}}
					>
						{status.label}
					</button>
				);
			})}
		</div>
	);
}
