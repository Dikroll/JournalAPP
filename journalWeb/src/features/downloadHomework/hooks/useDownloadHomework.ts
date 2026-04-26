import { useState } from 'react'

export function useDownloadHomework() {
	const [answerText, setAnswerText] = useState<string | null>(null)

	const downloadTask = (fileUrl: string | null) => {
		if (fileUrl) window.open(fileUrl, '_blank')
	}

	const viewAnswer = (
		studAnswer: string | null,
		studFileUrl: string | null = null,
	) => {
		const url =
			studFileUrl ?? (studAnswer?.startsWith('http') ? studAnswer : null)
		if (url) {
			window.open(url, '_blank')
		} else if (studAnswer) {
			setAnswerText(studAnswer)
		}
	}

	const closeAnswerSheet = () => setAnswerText(null)

	return { downloadTask, viewAnswer, answerText, closeAnswerSheet }
}
