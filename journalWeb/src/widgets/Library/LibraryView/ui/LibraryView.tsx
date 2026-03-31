import { useLibraryStore } from '@/entities/library'
import { useSubjects } from '@/entities/subject'
import { RefreshLibraryButton } from '@/features/refreshLibrary'
import { SpecSelector } from '@/features/selectSpec'
import { PageHeader } from '@/shared/ui/PageHeader/PageHeader'
import { useState } from 'react'
import { LibraryTabs } from '../../LibraryTabs/ui/LibraryTabs'

interface LibraryViewProps {
	showSpecSelector?: boolean
}

export const LibraryView = ({ showSpecSelector = true }: LibraryViewProps) => {
	const [selectedSpecId, setSelectedSpecId] = useState<number | null>(null)
	const { subjects, status: subjectsStatus } = useSubjects()
	const { reset } = useLibraryStore()

	const handleSpecChange = (spec: { id: number } | null) => {
		const newSpecId = spec?.id ?? null
		setSelectedSpecId(newSpecId)
		reset() // Reset store when spec changes
	}

	return (
		<div className='min-h-screen text-[#F2F2F2] pb-28 overflow-y-auto p-4'>
			<div className='space-y-4'>
				<PageHeader
					title='Библиотека материалов'
					actions={<RefreshLibraryButton />}
				/>

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
