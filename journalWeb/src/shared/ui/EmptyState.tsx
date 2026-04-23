import type { ReactNode } from 'react'

export interface EmptyStateProps {
	/**
	 * Main message to display
	 */
	message: string
	/**
	 * Optional subtitle or description
	 */
	description?: string
	/**
	 * Icon component to display (optional)
	 */
	icon?: ReactNode
	/**
	 * Illustration image URL or component (optional)
	 */
	illustration?: string | ReactNode
	/**
	 * Custom className for container
	 */
	className?: string
}

/**
 * Reusable empty state component
 * Eliminates repeated empty state patterns across widgets
 *
 * Used in: FutureExams, HomeworkList, ReviewList, LibraryTabs, and more
 */
export function EmptyState({
	message,
	description,
	icon,
	illustration,
	className = '',
}: EmptyStateProps) {
	return (
		<div
			className={`flex flex-col items-center justify-center py-8 px-4 text-center ${className}`}
		>
			{typeof illustration === 'string'
				? illustration && (
						<img
							src={illustration}
							alt={message}
							className='w-66 h-66 mb-4 opacity-75'
						/>
				  )
				: illustration && <div className='mb-4'>{illustration}</div>}

			{icon && <div className='mb-3 text-app-muted'>{icon}</div>}

			<p className='text-app-text text-base font-medium'>{message}</p>

			{description && (
				<p className='text-app-muted text-sm mt-1'>{description}</p>
			)}
		</div>
	)
}
