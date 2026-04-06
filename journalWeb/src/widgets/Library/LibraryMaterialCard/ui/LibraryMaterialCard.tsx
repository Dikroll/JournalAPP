import type { LibraryMaterial } from '@/entities/library'
import {
	getMaterialTypeColor,
	getMaterialTypeIcon,
} from '@/shared/config/libraryMaterialTypes'
import { formatDateCompact } from '@/shared/lib/formatDate'
import { memo } from 'react'
import { MaterialActions } from './MaterialActions'
import { MaterialCover } from './MaterialCover'

interface Props {
	material: LibraryMaterial

	onClick?: () => void
}

export const LibraryMaterialCard = memo(
	function LibraryMaterialCard({ material, onClick }: Props) {
		const tc = getMaterialTypeColor(material.material_type)

		return (
			<div
				onClick={onClick}
				className='bg-app-surface backdrop-blur-xl rounded-3xl overflow-hidden border-4 border-l-4 border-b-4 border-t-0 border-r-0'
				style={{ boxShadow: 'var(--shadow-card)', borderColor: tc.border }}
			>
				<MaterialCover material={material} typeColor={tc} />

				<div className='p-4'>
					<div className='flex items-start gap-3 mb-2'>
						<div
							className='shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center mt-0.5'
							style={{ background: tc.bg, color: tc.text }}
						>
							{getMaterialTypeIcon(material.material_type)}
						</div>

						<div className='flex-1 min-w-0'>
							<div className='flex items-center gap-1.5 mb-1 flex-wrap'>
								<span
									className='text-[11px] font-medium px-2 py-0.5 rounded-full'
									style={{ background: tc.bg, color: tc.text }}
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

					<div className='flex items-center gap-1.5 text-[11px] text-app-faint mb-1 pl-12'>
						<span>Неделя {material.week}</span>
						{material.date && (
							<>
								<span>·</span>
								<span>{formatDateCompact(material.date)}</span>
							</>
						)}
					</div>

					{material.description && (
						<p className='text-xs text-app-muted line-clamp-2 leading-relaxed mb-1 pl-12'>
							{material.description}
						</p>
					)}

					<MaterialActions
						url={material.url}
						link={material.link}
						downloadUrl={material.download_url}
						materialType={material.material_type}
					/>
				</div>
			</div>
		)
	},
	(prev, next) =>
		prev.material.material_id === next.material.material_id &&
		prev.material.theme === next.material.theme &&
		prev.material.cover_image === next.material.cover_image &&
		prev.material.url === next.material.url &&
		prev.material.link === next.material.link,
)
