import { PhotoViewerModal } from '@/shared/ui'
import { useState } from 'react'
import { createPortal } from 'react-dom'

interface UsePhotoViewerReturn {
	isOpen: boolean
	open: (src: string, alt?: string) => void
	close: () => void
	renderModal: (src: string, alt?: string) => React.ReactPortal | null
}

export function usePhotoViewer(): UsePhotoViewerReturn {
	const [isOpen, setIsOpen] = useState(false)
	const [currentSrc, setCurrentSrc] = useState<string | null>(null)
	const [currentAlt, setCurrentAlt] = useState<string>('')

	const open = (src: string, alt?: string) => {
		setCurrentSrc(src)
		setCurrentAlt(alt || '')
		setIsOpen(true)
	}

	const close = () => {
		setIsOpen(false)
		setCurrentSrc(null)
	}

	const renderModal = (src: string, alt?: string) => {
		if (!isOpen || currentSrc !== src) return null

		return createPortal(
			<PhotoViewerModal src={src} alt={alt || currentAlt} onClose={close} />,
			document.body,
		)
	}

	return {
		isOpen,
		open,
		close,
		renderModal,
	}
}
