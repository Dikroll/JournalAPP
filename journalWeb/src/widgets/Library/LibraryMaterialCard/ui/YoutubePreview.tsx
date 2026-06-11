import { Play } from "lucide-react";
import { useState } from "react";
import { useVideoPlayer, VideoPlayerOverlay } from "@/features/playVideo";

interface YoutubePreviewProps {
	thumbnailUrl: string | null;
	watchUrl: string;
	title: string;
	typeColor: { border: string; bg: string; text: string };
}

export function YoutubePreview({
	thumbnailUrl,
	watchUrl,
	title,
	typeColor,
}: YoutubePreviewProps) {
	const [thumbErr, setThumbErr] = useState(false);
	const { overlayUrl, openVideo, closeOverlay } = useVideoPlayer();

	const handleClick = () => {
		openVideo(watchUrl);
	};

	const previewHeight = { aspectRatio: "16/9" } as React.CSSProperties;

	if (thumbnailUrl && !thumbErr) {
		return (
			<>
				<button
					type="button"
					onClick={handleClick}
					className="relative w-full overflow-hidden block focus:outline-none group"
					style={previewHeight}
				>
					<img
						src={thumbnailUrl}
						alt={title}
						className="w-full h-full object-cover"
						loading="lazy"
						onError={() => setThumbErr(true)}
					/>
					<div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
						<div
							className="w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
							style={{
								background: "rgba(255,0,0,0.9)",
								boxShadow: "0 4px 24px rgba(255,0,0,0.5)",
							}}
						>
							<Play
								size={28}
								className="text-white"
								style={{ marginLeft: 3 }}
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

	return (
		<>
			<button
				type="button"
				onClick={handleClick}
				className="relative w-full flex items-center justify-center focus:outline-none group"
				style={{
					...previewHeight,
					background: `linear-gradient(135deg, ${typeColor.bg} 0%, var(--color-surface-strong) 100%)`,
					borderBottom: `1px solid ${typeColor.border}`,
				}}
			>
				<div
					className="w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
					style={{
						background: "rgba(255,0,0,0.85)",
						boxShadow: "0 4px 20px rgba(255,0,0,0.35)",
					}}
				>
					<Play size={26} className="text-white" style={{ marginLeft: 3 }} />
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
