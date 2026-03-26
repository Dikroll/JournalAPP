interface InlineImageProps {
	src: string
	alt?: string
	className?: string
	width?: number
	height?: number
}

/**
 * Компонент для отображения SVG изображений из файлов
 * Идеален для мобильных приложений (Capacitor), так как не требует загрузки из интернета
 */
export function InlineImage({
	src,
	alt = 'Image',
	className = '',
	width,
	height,
}: InlineImageProps) {
	return (
		<img
			src={src}
			alt={alt}
			className={className}
			width={width}
			height={height}
			style={{
				width: width ? `${width}px` : '100%',
				height: height ? `${height}px` : 'auto',
			}}
		/>
	)
}
