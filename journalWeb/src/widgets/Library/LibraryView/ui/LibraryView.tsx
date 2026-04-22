import { RefreshLibraryButton } from '@/features/refreshLibrary'
import { SpecSelector, useLibrarySpecSelection } from '@/features/selectSpec'
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader'
import { LibraryTabs } from '../../LibraryTabs/ui/LibraryTabs'

interface LibraryViewProps {
	showSpecSelector?: boolean
}

export const LibraryView = ({ showSpecSelector = true }: LibraryViewProps) => {
	const { selectedSpecId, subjects, subjectsStatus, handleSpecChange } =
		useLibrarySpecSelection()

	return (
		<div className='min-h-screen text-app-text pb-28 overflow-y-auto p-4'>
			<div className='space-y-4'>
				<PageHeader title='Библиотека' actions={<RefreshLibraryButton />} />

				{showSpecSelector && (
					<SpecSelector
						subjects={subjects}
						selectedId={selectedSpecId}
						onChange={handleSpecChange}
						loading={subjectsStatus === 'loading'}
					/>
				)}

				<LibraryTabs specId={selectedSpecId ?? undefined} />
			</div>
		</div>
	)
}
