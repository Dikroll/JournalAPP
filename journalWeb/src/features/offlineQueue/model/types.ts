export interface QueuedHomework {
	id: string
	homeworkId: number
	studId: number | null
	userId: number | null
	text: string
	mark: number
	fileName: string | null
	fileLocalPath: string | null
	fileMimeType: string | null
	status: 'pending' | 'processing' | 'failed'
	attempts: number
	lastError: string | null
	createdAt: number
}
