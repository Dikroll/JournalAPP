export interface PendingFeedback {
	key: string
	date: string
	teacher: string
	subject: string
	teacher_photo: string | null
}

export interface FeedbackTag {
	id: number
	key: string
}

export interface EvaluatePayload {
	key: string
	mark_lesson: number
	mark_teach: number
	tags_lesson: number[]
	tags_teach: number[]
	comment_lesson: string
	comment_teach: string
}
