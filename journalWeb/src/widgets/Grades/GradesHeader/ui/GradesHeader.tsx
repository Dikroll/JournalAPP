import { RefreshGradesButton } from '@/features/refreshGrades'
import { PageHeader } from '@/shared/ui'

export function GradesHeader() {
	return <PageHeader title='Оценки' actions={<RefreshGradesButton />} />
}
