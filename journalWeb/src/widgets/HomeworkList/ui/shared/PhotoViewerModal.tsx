import { X, ZoomIn, ZoomOut } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

interface Props {
	src: string
	alt?: string
	onClose: () => void
}

export function PhotoViewerModal({ src, alt, onClose }: Props) {
	return (
		<Lightbox
			open
			close={onClose}
			slides={[{ src, alt: alt ?? '' }]}
			plugins={[Zoom]}
			zoom={{
				maxZoomPixelRatio: 5,
				zoomInMultiplier: 2,
				doubleTapDelay: 300,
				doubleClickDelay: 300,
				doubleClickMaxStops: 1,
				wheelZoomDistanceFactor: 100,
				pinchZoomDistanceFactor: 100,
				scrollToZoom: true,
			}}
			carousel={{ finite: true }}
			controller={{ closeOnBackdropClick: true }}
			render={{
				buttonPrev: () => null,
				buttonNext: () => null,
				iconZoomIn: () => <ZoomIn size={16} />,
				iconZoomOut: () => <ZoomOut size={16} />,
				iconClose: () => <X size={16} />,
			}}
			styles={{
				container: {
					backgroundColor: 'rgba(0, 0, 0, 0.75)',
					backdropFilter: 'blur(16px)',
					WebkitBackdropFilter: 'blur(16px)',
				},
				button: {
					filter: 'none',
					color: 'rgba(255,255,255,0.6)',
					padding: '8px',
					borderRadius: '12px',
					backgroundColor: 'rgba(0,0,0,0.35)',
					backdropFilter: 'blur(8px)',
				},
			}}
		/>
	)
}
