import { useState } from "react";
import { createPortal } from "react-dom";
import { PhotoViewerModal } from "@/shared/ui";

interface Props {
	photoUrl: string;
	title: string;
	onError: () => void;
}

export function ImageCover({ photoUrl, title, onError }: Props) {
	const [viewerOpen, setViewerOpen] = useState(false);

	return (
		<>
			<button
				type="button"
				onClick={() => setViewerOpen(true)}
				className="w-full overflow-hidden block focus:outline-none"
				style={{ height: 160 }}
			>
				<img
					src={photoUrl}
					alt={title}
					className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
					onError={onError}
				/>
			</button>

			{viewerOpen &&
				createPortal(
					<PhotoViewerModal
						src={photoUrl}
						alt={title}
						onClose={() => setViewerOpen(false)}
					/>,
					document.body,
				)}
		</>
	);
}
