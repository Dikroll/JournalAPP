import type { LibraryMaterial } from '@/entities/library'
import { getCachedImageUrl } from '@/shared/lib'
import { PhotoViewerModal } from '@/widgets/HomeworkList/ui/shared/PhotoViewerModal'
import { Download, ExternalLink } from 'lucide-react'
import { memo, useState } from 'react'
import { createPortal } from 'react-dom'

interface LibraryMaterialCardProps {
	material: LibraryMaterial
	onClick?: () => void
}

export const LibraryMaterialCard = memo(
	function LibraryMaterialCard({
		material,
		onClick,
	}: LibraryMaterialCardProps) {
		const [viewerOpen, setViewerOpen] = useState(false)

		const photoUrl = getCachedImageUrl(material.cover_image)

		const handleDownload = (e: React.MouseEvent) => {
			e.stopPropagation()
			if (material.download_url) {
				window.open(material.download_url, '_blank')
			}
		}

		const handleOpenLink = (e: React.MouseEvent) => {
			e.stopPropagation()
			if (material.link) {
				window.open(material.link, '_blank')
			}
		}

		const hasPhoto = !!photoUrl

		return (
			<>
				<div
					onClick={onClick}
					className='bg-app-surface backdrop-blur-xl rounded-[24px] p-5 border-4 border-l-4 border-b-4 border-app-border border-t-0 border-r-0 overflow-hidden'
					style={{ boxShadow: 'var(--shadow-card)' }}
				>
					{/* Cover Image */}
					{hasPhoto && (
						<button
							type='button'
							onClick={e => {
								e.stopPropagation()
								setViewerOpen(true)
							}}
							className='w-full mb-4 rounded-2xl overflow-hidden bg-app-surface'
						>
							<img
								src={photoUrl}
								alt={material.theme}
								className='w-full h-48 object-cover transition-transform duration-300 hover:scale-[1.02]'
							/>
						</button>
					)}
					{/* Header */}
					<div className='flex items-start justify-between mb-3'>
						<div className='flex-1 min-w-0'>
							<div className='flex items-center gap-2 mb-1'>
								<span className='text-xs font-medium px-2 py-0.5 rounded-full text-app-text bg-app-surface'>
									{material.type_name}
								</span>
								{material.is_new && (
									<span className='text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'>
										NEW
									</span>
								)}
							</div>
							<h3 className='text-base font-semibold text-app-text leading-snug'>
								{material.theme}
							</h3>
							<p className='text-sm text-app-muted line-clamp-2 mt-0.5'>
								{material.spec_name}
							</p>
							<div className='flex items-center gap-1.5 mt-1 text-[12px]'>
								<span className='text-app-text'>Неделя {material.week}</span>
								{material.date && (
									<>
										<span className='text-app-muted'>•</span>
										<span className='text-app-text'>
											{new Date(material.date).toLocaleDateString('ru-RU')}
										</span>
									</>
								)}
							</div>
						</div>
					</div>

					{/* Description */}
					{material.description && (
						<p className='text-sm text-app-text mb-4 line-clamp-3'>
							{material.description}
						</p>
					)}

					{/* Actions */}
					<div className='flex gap-2'>
						{material.link && (
							<button
								onClick={handleOpenLink}
								className='flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-2xl bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors'
							>
								<ExternalLink size={16} />
								<span>Открыть</span>
							</button>
						)}
						{material.download_url && (
							<button
								onClick={handleDownload}
								className='flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-2xl bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-800 transition-colors'
							>
								<Download size={16} />
								<span>Скачать</span>
							</button>
						)}
					</div>
				</div>

				{viewerOpen &&
					createPortal(
						<PhotoViewerModal
							src={photoUrl!}
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
