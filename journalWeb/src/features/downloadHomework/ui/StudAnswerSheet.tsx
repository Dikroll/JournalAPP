import { MessageSquare, X } from "lucide-react";
import { createPortal } from "react-dom";
import { CatGame } from "@/features/playCatGame";
import { BottomSheet, IconButton } from "@/shared/ui";

interface Props {
	answer: string;
	homeworkTheme: string;
	onClose: () => void;
}

export function StudAnswerSheet({ answer, homeworkTheme, onClose }: Props) {
	return createPortal(
		<BottomSheet onBackdropClick={onClose} zIndex={300} maxWidth="max-w-lg">
			<div className="flex flex-col overflow-hidden">
				{/* Header */}
				<div className="flex items-center justify-between pb-3 flex-shrink-0">
					<div className="flex items-center gap-2.5">
						<div className="w-9 h-9 rounded-2xl bg-glass border border-glass-border flex items-center justify-center">
							<MessageSquare size={16} className="text-app-muted" />
						</div>
						<div>
							<p className="text-xs text-app-muted leading-none mb-1">
								Мой ответ
							</p>
							<p className="text-sm font-semibold text-app-text leading-none line-clamp-1">
								{homeworkTheme}
							</p>
						</div>
					</div>
					<IconButton
						icon={<X size={15} />}
						onClick={onClose}
						shape="square"
						aria-label="Закрыть"
					/>
				</div>

				{/* Answer — scrollable, max ~5 lines visible */}
				<div
					className="mb-3 rounded-2xl bg-glass border border-glass-border px-4 py-3 flex-shrink-0 overflow-y-auto"
					style={{ maxHeight: "9rem" }}
				>
					<p className="text-sm text-app-text leading-relaxed whitespace-pre-wrap break-words">
						{answer}
					</p>
				</div>

				{/* Label */}
				<div className="flex items-center gap-3 mb-2 flex-shrink-0">
					<div className="h-px flex-1 bg-glass-border" />
					<p className="text-[10px] text-app-muted tracking-widest uppercase select-none">
						пока ждёшь оценку...
					</p>
					<div className="h-px flex-1 bg-glass-border" />
				</div>

				{/* Game — fixed comfortable height */}
				<div className="flex-shrink-0" style={{ height: "240px" }}>
					<div className="w-full h-full rounded-2xl overflow-hidden">
						<CatGame />
					</div>
				</div>
			</div>
		</BottomSheet>,
		document.body,
	);
}
