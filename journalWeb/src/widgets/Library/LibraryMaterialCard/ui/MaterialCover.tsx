import { memo, useState } from "react";
import type { LibraryMaterial } from "@/entities/library";
import {
	getCachedImageUrl,
	getYouTubeThumbnail,
	toYouTubeEmbed,
} from "@/shared/lib";
import { ExternalVideoCover } from "./ExternalVideoCover";
import { ImageCover } from "./ImageCover";
import { PlaceholderCover } from "./PlaceholderCover";
import { YoutubePreview } from "./YoutubePreview";

interface Props {
	material: LibraryMaterial;
	typeColor: { border: string; bg: string; text: string };
}

export const MaterialCover = memo(function MaterialCover({
	material,
	typeColor,
}: Props) {
	const [imgError, setImgError] = useState(false);

	const photoUrl = getCachedImageUrl(material.cover_image);
	const isVideo = material.material_type === 5;

	const youtubeEmbed =
		isVideo && material.url ? toYouTubeEmbed(material.url) : null;
	const youtubeThumbnail =
		isVideo && material.url ? getYouTubeThumbnail(material.url) : null;
	const isExternalVideo = isVideo && !!material.url && !youtubeEmbed;

	// YouTube
	if (youtubeEmbed) {
		return (
			<YoutubePreview
				thumbnailUrl={youtubeThumbnail}
				watchUrl={material.url!}
				title={material.theme}
				typeColor={typeColor}
			/>
		);
	}

	// Внешнее видео (+ обложка или без)
	if (isExternalVideo) {
		return (
			<ExternalVideoCover
				url={material.url!}
				title={material.theme}
				photoUrl={!imgError ? photoUrl : null}
				typeColor={typeColor}
			/>
		);
	}

	// Обычная обложка
	if (photoUrl && !imgError) {
		return (
			<ImageCover
				photoUrl={photoUrl}
				title={material.theme}
				onError={() => setImgError(true)}
			/>
		);
	}

	// Заглушка
	return (
		<PlaceholderCover
			materialType={material.material_type}
			typeColor={typeColor}
		/>
	);
});
