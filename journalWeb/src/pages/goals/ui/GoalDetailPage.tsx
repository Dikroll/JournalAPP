import { PageHeader } from '@/shared/ui'
import { useParams } from 'react-router-dom'

export function GoalDetailPage() {
	const { specId } = useParams<{ specId: string }>()
	return (
		<div className='min-h-screen text-app-text pb-28'>
			<div className='p-4 space-y-4'>
				<PageHeader title={`Предмет #${specId ?? '?'}`} />
				<div className='text-app-muted text-sm'>Скоро тут появится детальный экран.</div>
			</div>
		</div>
	)
}
