import type { LoadingState } from '@/shared/types'
import { SkeletonList } from '../SkeletonList/SkeletonList'

interface Props {
	status: LoadingState
	isEmpty?: boolean
	emptyText?: string
	errorText?: string
	skeletonCount?: number
	skeletonHeight?: number
	children: React.ReactNode
}

export function StatusView({
	status,
	isEmpty = false,
	emptyText = 'Нет данных',
	errorText = 'Ошибка загрузки',
	skeletonCount = 3,
	skeletonHeight = 80,
	children,
}: Props) {
	if (status === 'loading' || status === 'idle') {
		return <SkeletonList count={skeletonCount} height={skeletonHeight} />
	}
	if (status === 'error') {
		return (
			<p className='text-status-overdue text-sm text-center py-8'>
				{errorText}
			</p>
		)
	}
	if (isEmpty) {
		return (
			<p className='text-app-muted text-sm text-center py-8'>{emptyText}</p>
		)
	}
	return <>{children}</>
}
