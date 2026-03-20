interface Props {
	count?: number
	height?: number
	className?: string
}

export function SkeletonList({
	count = 3,
	height = 80,
	className = '',
}: Props) {
	return (
		<div className={`space-y-3 ${className}`}>
			{Array.from({ length: count }).map((_, i) => (
				<div
					key={i}
					className='bg-app-surface rounded-[24px] animate-pulse'
					style={{ height }}
				/>
			))}
		</div>
	)
}
