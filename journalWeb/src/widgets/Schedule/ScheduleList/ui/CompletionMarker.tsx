import { CheckCircle2 } from "lucide-react";

interface Props {
	color: string;
	setDotRef: (node: HTMLSpanElement | null) => void;
}

export function CompletionMarker({ color, setDotRef }: Props) {
	return (
		<li className="relative flex h-8 items-center select-none pointer-events-none">
			<span
				ref={setDotRef}
				className="pointer-events-none absolute left-[16px] top-1/2 h-0 w-0"
				aria-hidden="true"
			/>
			<div
				className="absolute left-[16px] top-1/2 z-10 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border"
				style={{
					background: color,
					borderColor: color,
					boxShadow: `0 0 0 2px var(--color-surface), 0 0 14px ${color}35`,
				}}
			>
				<CheckCircle2 size={12} className="text-white" />
			</div>
			<div className="pl-[36px] flex flex-1 items-center gap-3">
				<span className="text-[12px] font-medium" style={{ color: color }}>
					На сегодня всё
				</span>
				<div
					className="flex-1 h-px border-b border-dashed"
					style={{ borderColor: `${color}40` }}
				/>
			</div>
		</li>
	);
}
