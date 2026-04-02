import type { LibraryMaterial } from '@/entities/library'
import { getCachedImageUrl } from '@/shared/lib'
import { PhotoViewerModal } from '@/widgets/HomeworkList/ui/shared/PhotoViewerModal'
import { BookOpen, Download, ExternalLink, FileText, Lightbulb, TestTube, Video } from 'lucide-react'
import { memo, useState } from 'react'
import { createPortal } from 'react-dom'

const TYPE_ICONS: Record<number, React.ReactNode> = {
	1: <BookOpen size={16} />,
	2: <FileText size={16} />,
	3: <Video size={16} />,
	4: <Lightbulb size={16} />,
	5: <TestTube size={16} />,
	6: <FileText size={16} />,
	7: <TestTube size={16} />,
	8: <FileText size={16} />,
}

const TYPE_COLORS: Record<number, { border: string; bg: string; text: string }> = {
	1: { border: 'var(--color-new)', bg: 'var(--color-new-subtle)', text: 'var(--color-new)' },
	2: { border: 'var(--color-checked)', bg: 'var(--color-checked-subtle)', text: 'var(--color-checked)' },
	3: { border: 'var(--color-pending)', bg: 'var(--color-pending-subtle)', text: 'var(--color-pending)' },
	4: { border: 'var(--color-comment)', bg: 'var(--color-comment-subtle)', text: 'var(--color-comment)' },
	5: { border: 'var(--color-checked)', bg: 'var(--color-checked-subtle)', text: 'var(--color-checked)' },
	6: { border: 'var(--color-returned)', bg: 'var(--color-returned-subtle)', text: 'var(--color-returned)' },
	7: { border: 'var(--color-overdue)', bg: 'var(--color-overdue-bg)', text: 'var(--color-overdue)' },
	8: { border: 'var(--color-returned)', bg: 'var(--color-returned-subtle)', text: 'var(--color-returned)' },
}

interface LibraryMaterialCardProps {
	material: LibraryMaterial
	onClick?: () => void
}

export const LibraryMaterialCard = memo(
	function LibraryMaterialCard({ material, onClick }: LibraryMaterialCardProps) {
		const [viewerOpen, setViewerOpen] = useState(false)
		const photoUrl = getCachedImageUrl(material.cover_image)
		const hasPhoto = !!photoUrl

		const typeColor = TYPE_COLORS[material.material_type] ?? TYPE_COLORS[6]

		const handleDownload = (e: React.MouseEvent) => {
			e.stopPropagation()
			if (material.download_url) window.open(material.download_url, '_blank')
		}

		const handleOpenLink = (e: React.MouseEvent) => {
			e.stopPropagation()
			if (material.link) window.open(material.link, '_blank')
		}

		return (
			<>
				<div
					onClick={onClick}
					className='bg-app-surface backdrop-blur-xl rounded-[24px] p-5 border-4 border-l-4 border-b-4 border-t-0 border-r-0 overflow-hidden'
					style={{
						boxShadow: 'var(--shadow-card)',
						borderColor: typeColor.border,
					}}
				>
					{/* Обложка */}
					{hasPhoto && (
						<button
							type='button'
							onClick={e => { e.stopPropagation(); setViewerOpen(true) }}
							className='w-full mb-4 rounded-2xl overflow-hidden bg-app-surface-strong block focus:outline-none'
						>
							<img
								src={photoUrl}
								alt={material.theme}
								className='w-full h-40 object-cover transition-transform duration-300 hover:scale-[1.02]'
							/>
						</button>
					)}

					{/* Заголовок */}
					<div className='flex items-center gap-3 mb-3'>
						<div
							className='flex-shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center'
							style={{
								background: typeColor.bg,
								color: typeColor.text,
							}}
						>
							{TYPE_ICONS[material.material_type] ?? <FileText size={16} />}
						</div>

						<div className='flex-1 min-w-0'>
							<div className='flex items-center gap-1.5 mb-1 flex-wrap'>
								<span
									className='text-xs font-medium px-2 py-0.5 rounded-full'
									style={{
										background: typeColor.bg,
										color: typeColor.text,
									}}
								>
									{material.type_name}
								</span>
								{material.is_new && (
									<span
										className='text-[10px] font-bold px-1.5 py-0.5 rounded-full'
										style={{
											background: 'var(--color-new-subtle)',
											color: 'var(--color-new)',
											border: '1px solid var(--color-new-border)',
										}}
									>
										NEW
									</span>
								)}
							</div>
							<h3 className='text-sm font-semibold text-app-text leading-snug'>
								{material.theme}
							</h3>
							<p className='text-xs text-app-muted mt-0.5 truncate'>
								{material.spec_name}
							</p>
						</div>
					</div>

					{/* Мета */}
					<div className='flex items-center gap-1.5 mb-3 text-[11px] text-app-muted'>
						<span>Неделя {material.week}</span>
						{material.date && (
							<>
								<span>•</span>
								<span>{new Date(material.date).toLocaleDateString('ru-RU')}</span>
							</>
						)}
					</div>

					{/* Описание */}
					{material.description && (
						<p className='text-xs text-app-muted mb-4 line-clamp-2 leading-relaxed'>
							{material.description}
						</p>
					)}

					{/* Кнопки */}
					{(material.link || material.download_url) && (
						<div className='flex gap-2'>
							{material.link && (
								<button
									onClick={handleOpenLink}
									className='flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-app-surface hover:bg-app-surface-hover rounded-2xl text-app-muted hover:text-app-text border border-app-border transition-colors text-xs'
								>
									<ExternalLink size={14} />
									<span>Открыть</span>
								</button>
							)}
							{material.download_url && (
								<button
									onClick={handleDownload}
									className='flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-app-surface hover:bg-app-surface-hover rounded-2xl text-app-muted hover:text-app-text border border-app-border transition-colors text-xs'
								>
									<Download size={14} />
									<span>Скачать</span>
								</button>
							)}
						</div>
					)}
				</div>

				{viewerOpen && photoUrl && createPortal(
					<PhotoViewerModal
						src={photoUrl}
						alt={material.theme}
						onClose={() => setViewerOpen(false)}
					/>,
					document.body,
				)}
			</>
		)
	},
	(prev, next) =>
		prev.material.material_id === next.material.material_id &&
		prev.material.theme === next.material.theme &&
		prev.material.cover_image === next.material.cover_image &&
		prev.material.description === next.material.description,
)