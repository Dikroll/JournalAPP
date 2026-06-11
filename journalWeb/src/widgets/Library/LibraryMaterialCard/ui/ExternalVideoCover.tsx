import { Play } from "lucide-react";
import { useState } from "react";
import { useVideoPlayer, VideoPlayerOverlay } from "@/features/playVideo";

interface Props {
	url: string;
	title: string;
	photoUrl?: string | null;
	typeColor: { border: string; bg: string; text: string };
}

export function ExternalVideoCover({ url, title, photoUrl, typeColor }: Props) {
	const [imgError, setImgError] = useState(false);
	const { overlayUrl, openVideo, closeOverlay } = useVideoPlayer();

	// Внешнее видео + обложка
	if (photoUrl && !imgError) {
		return (
			<>
				<button
					type="button"
					onClick={() => openVideo(url)}
					className="relative w-full overflow-hidden block focus:outline-none group"
					style={{ aspectRatio: "16/9" }}
				>
					<img
						src={photoUrl}
						alt={title}
						className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
						onError={() => setImgError(true)}
					/>
					<div className="absolute inset-0 flex items-center justify-center bg-black/25">
						<div
							className="w-12 h-12 rounded-full flex items-center justify-center"
							style={{
								background: "rgba(0,0,0,0.55)",
								backdropFilter: "blur(4px)",
								border: "1.5px solid rgba(255,255,255,0.3)",
							}}
						>
							<Play
								size={22}
								className="text-white"
								style={{ marginLeft: 2 }}
							/>
						</div>
					</div>
				</button>

				{overlayUrl && (
					<VideoPlayerOverlay
						url={overlayUrl}
						title={title}
						onClose={closeOverlay}
					/>
				)}
			</>
		);
	}

	// Внешнее видео без обложки
	return (
		<>
			<button
				type="button"
				onClick={() => openVideo(url)}
				className="w-full flex flex-col items-center justify-center gap-2.5 focus:outline-none"
				style={{
					height: 148,
					background: typeColor.bg,
					borderBottom: `1px solid ${typeColor.border}`,
				}}
			>
				<div
					className="w-12 h-12 rounded-full flex items-center justify-center"
					style={{
						background: "rgba(255,255,255,0.08)",
						border: `1.5px solid ${typeColor.border}`,
					}}
				>
					<Play size={22} style={{ color: typeColor.text, marginLeft: 2 }} />
				</div>
				<span className="text-xs font-medium" style={{ color: typeColor.text }}>
					Смотреть видео
				</span>
			</button>

			{overlayUrl && (
				<VideoPlayerOverlay
					url={overlayUrl}
					title={title}
					onClose={closeOverlay}
				/>
			)}
		</>
	);
}
