import { Check, ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";

import { useCloseOnOutsideClick } from "@/shared/hooks/useCloseOnOutsideClick";

export const GRADE_OPTIONS = [
	{ value: "all", label: "Все оценки" },
	{ value: "5", label: "Только 5" },
	{ value: "4", label: "Только 4" },
	{ value: "3", label: "Только 3" },
	{ value: "2", label: "Только 2" },
] as const;

export interface DesktopGradeFilterProps {
	value: string;
	onChange: (value: string) => void;
}

export function DesktopGradeFilter({
	value,
	onChange,
}: DesktopGradeFilterProps) {
	const [open, setOpen] = useState(false);
	const ref = useCloseOnOutsideClick<HTMLDivElement>(
		open,
		useCallback(() => setOpen(false), []),
	);
	const selected = GRADE_OPTIONS.find((option) => option.value === value);

	return (
		<div ref={ref} className="relative shrink-0">
			<button
				type="button"
				onClick={() => setOpen((current) => !current)}
				className="flex h-12 min-w-[146px] items-center justify-between gap-3 rounded-3xl border border-app-border bg-app-surface px-4 text-sm font-semibold text-app-text transition-colors hover:bg-app-surface-hover"
			>
				<span>
					{selected?.value === "all"
						? selected.label
						: `Оценки: ${selected?.value}`}
				</span>
				<ChevronDown
					size={16}
					className={`text-app-muted transition-transform ${
						open ? "rotate-180" : ""
					}`}
				/>
			</button>

			{open && (
				<div
					className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-3xl border border-app-border py-1"
					style={{
						backgroundColor: "var(--color-bg)",
						boxShadow: "0 24px 60px rgba(0, 0, 0, 0.28)",
					}}
				>
					{GRADE_OPTIONS.map((option) => {
						const isSelected = option.value === value;
						return (
							<button
								key={option.value}
								type="button"
								onClick={() => {
									onChange(option.value);
									setOpen(false);
								}}
								className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
									isSelected
										? "bg-app-surface-strong text-app-text"
										: "text-app-muted hover:bg-app-surface-hover hover:text-app-text"
								}`}
							>
								<span>{option.label}</span>
								{isSelected && <Check size={15} className="text-brand" />}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
