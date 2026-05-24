import { useLibraryStore } from '@/entities/library'
import { useSubjects } from '@/entities/subject'
import { useState } from 'react'

export function useLibrarySpecSelection() {
	const [selectedSpecId, setSelectedSpecId] = useState<number | null>(null)
	const { subjects, status: subjectsStatus } = useSubjects()
	const setSelectedSpec = useLibraryStore(state => state.setSelectedSpec)

	const handleSpecChange = (spec: { id: number } | null) => {
		const nextSpecId = spec?.id ?? null
		setSelectedSpecId(nextSpecId)
		setSelectedSpec(nextSpecId)
	}

	return {
		selectedSpecId,
		subjects,
		subjectsStatus,
		handleSpecChange,
	}
}
