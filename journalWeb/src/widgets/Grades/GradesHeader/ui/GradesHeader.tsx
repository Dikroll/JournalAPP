import { RefreshGradesButton } from '@/features/refreshGrades'

export function GradesHeader() {
	return (
		<div className='flex items-center justify-between'>
			<h1 className='text-2xl font-bold'>Оценки</h1>
			<RefreshGradesButton />
		</div>
	)
}
