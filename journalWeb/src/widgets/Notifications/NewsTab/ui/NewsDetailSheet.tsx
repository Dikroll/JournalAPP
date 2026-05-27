import { X } from "lucide-react";
import { useNewsDetail } from "@/entities/news";
import { BottomSheet, IconButton } from "@/shared/ui";

interface NewsDetailSheetProps {
	id: number;
	onClose: () => void;
}

export function NewsDetailSheet({ id, onClose }: NewsDetailSheetProps) {
	const { detail, status } = useNewsDetail(id);

	return (
		<BottomSheet onBackdropClick={onClose} zIndex={300}>
			<div className="flex flex-col" style={{ maxHeight: "80dvh" }}>
				<div className="flex justify-between items-start mb-4 flex-shrink-0">
					<h2 className="text-xl font-bold text-app-text leading-tight pr-4">
						{detail?.title || "Загрузка..."}
					</h2>
					<IconButton
						icon={<X size={20} />}
						onClick={onClose}
						size="sm"
						className="-mt-2 -mr-2 text-app-muted hover:text-app-text"
						aria-label="Закрыть"
					/>
				</div>

				<div
					className="overflow-y-auto pb-8 relative custom-scrollbar"
					style={{ overscrollBehavior: "contain" }}
				>
					{status === "loading" && (
						<div className="flex justify-center py-10">
							<div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
						</div>
					)}
					{status === "error" && (
						<div className="text-danger text-center py-10">
							Не удалось загрузить новость
						</div>
					)}
					{detail?.content_html && (
						<div
							className="prose prose-invert max-w-none text-app-text text-sm"
							dangerouslySetInnerHTML={{ __html: detail.content_html }}
							style={
								{
									"--tw-prose-body": "var(--color-text)",
									"--tw-prose-bold": "var(--color-text)",
									"--tw-prose-links": "var(--color-accent)",
								} as React.CSSProperties
							}
						/>
					)}

					{/* Встроенные стили для контента новости, чтобы картинки и отступы выглядели красиво */}
					<style>{`
						.prose img {
							border-radius: 16px;
							max-width: 100%;
							height: auto;
							margin-bottom: 16px;
						}
						.prose p {
							margin-bottom: 12px;
							line-height: 1.5;
						}
						.prose b, .prose strong {
							font-weight: 600;
						}
						.prose a {
							color: var(--color-accent);
							text-decoration: none;
						}
						.prose a:hover {
							text-decoration: underline;
						}
					`}</style>
				</div>
			</div>
		</BottomSheet>
	);
}
