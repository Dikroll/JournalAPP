import { CalendarDays, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { FutureExamItem } from "@/entities/exam";
import { useIsDesktop } from "@/shared/hooks/useIsDesktop";
import { formatDate } from "@/shared/utils";

interface Props {
	isOpen: boolean;
	onClose: () => void;
	exams: FutureExamItem[];
}

export function FutureExamsModal({ isOpen, onClose, exams }: Props) {
	const isDesktop = useIsDesktop();

	useEffect(() => {
		if (!isOpen || !isDesktop) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, isDesktop, onClose]);

	if (!isOpen) return null;

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-200">
			{/* Backdrop */}
			<button
				type="button"
				aria-label="Закрыть будущие экзамены"
				className="absolute inset-0 bg-black/85"
				onClick={onClose}
			/>

			{/* Modal Container */}
			<div className="relative w-full max-w-2xl max-h-full flex flex-col bg-[#202126] border border-[#3A3B42] rounded-[24px] shadow-2xl overflow-hidden">
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-[#34363D] gap-4 shrink-0">
					<h2 className="text-xl font-bold text-app-text">Будущие экзамены</h2>

					<button
						type="button"
						onClick={onClose}
						className="absolute top-6 right-6 text-app-muted hover:text-app-text transition-colors"
					>
						<X size={20} />
					</button>
				</div>

				{/* Content Scroll Area */}
				<div
					className="flex-1 overflow-y-auto p-6"
					style={{ scrollbarWidth: "thin" }}
				>
					<ul className="flex flex-col gap-2">
						{exams.map((exam) => (
							<li key={`${exam.date}-${exam.spec}`}>
								<div className="flex items-center gap-3 rounded-[18px] border border-[#454750] bg-[#303238] p-3">
									<div
										className="flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center"
										style={
											exam.days_left !== null && exam.days_left > 7
												? {
														background: "var(--color-checked-bg)",
														border: "1px solid var(--color-checked-border)",
													}
												: {
														background: "var(--color-overdue-bg)",
														border: "1px solid var(--color-overdue-border)",
													}
										}
									>
										<CalendarDays
											size={16}
											className={`mb-0.5 ${
												exam.days_left !== null && exam.days_left > 7
													? "text-status-checked"
													: "text-status-overdue"
											}`}
										/>
										{exam.days_left !== null && (
											<span
												className={`text-[10px] font-bold leading-none ${
													exam.days_left > 7
														? "text-status-checked"
														: "text-status-overdue"
												}`}
											>
												{exam.days_left}д
											</span>
										)}
									</div>
									<div className="flex flex-col min-w-0">
										<div
											className="font-semibold text-[14px] leading-snug text-app-text"
											title={exam.spec}
										>
											{exam.spec}
										</div>
										<div className="text-app-muted text-[12px] mt-1">
											{formatDate(exam.date)}
										</div>
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>,
		document.body,
	);
}
