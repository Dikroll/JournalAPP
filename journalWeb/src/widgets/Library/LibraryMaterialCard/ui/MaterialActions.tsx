import { canOpenMaterial, getOpenUrl } from '@/shared/lib/materialUrls'
import { Download, ExternalLink } from 'lucide-react'

interface Props {
	/** url — embed/внешняя ссылка, link — FS-файл */
	url: string | null
	link: string | null
	downloadUrl: string | null
	materialType: number
}

export function MaterialActions({
	url,
	link,
	downloadUrl,
	materialType,
}: Props) {
	const openUrl = getOpenUrl(materialType, url, link)
	const canOpen = canOpenMaterial(materialType, url, link)
	const canDownload = !!downloadUrl

	if (!canOpen && !canDownload) return null

	const handleOpen = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (openUrl) window.open(openUrl, '_blank')
	}

	const handleDownload = (e: React.MouseEvent) => {
		e.stopPropagation()
		if (downloadUrl) window.open(downloadUrl, '_blank')
	}

	return (
		<div className='flex gap-2 mt-3'>
			{canOpen && (
				<button
					onClick={handleOpen}
					className='flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-app-surface hover:bg-app-surface-hover rounded-2xl text-app-muted hover:text-app-text border border-app-border transition-colors text-xs'
				>
					<ExternalLink size={14} />
					<span>Открыть</span>
				</button>
			)}
			{canDownload && (
				<button
					onClick={handleDownload}
					className='flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-app-surface hover:bg-app-surface-hover rounded-2xl text-app-muted hover:text-app-text border border-app-border transition-colors text-xs'
				>
					<Download size={14} />
					<span>Скачать</span>
				</button>
			)}
		</div>
	)
}
