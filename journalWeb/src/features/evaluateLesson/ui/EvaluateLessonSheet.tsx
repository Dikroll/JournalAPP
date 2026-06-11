import { createPortal } from "react-dom";
import type { FeedbackTag, PendingFeedback } from "@/entities/feedback";
import { BottomSheet } from "@/shared/ui";
import { useEvaluateLesson } from "../hooks/useEvaluateLesson";
import {
	EvaluateErrorView,
	EvaluateLessonFormView,
	EvaluateSuccessView,
	EvaluateTeacherFormView,
} from "./views/EvaluateLessonViews";

interface Props {
	item: PendingFeedback;
	tags: FeedbackTag[];
	onClose: () => void;
}

export function EvaluateLessonSheet({ item, tags, onClose }: Props) {
	const {
		step,
		markLesson,
		setMarkLesson,
		markTeach,
		setMarkTeach,
		tagsLesson,
		toggleLessonTag,
		tagsTeach,
		toggleTeachTag,
		commentLesson,
		setCommentLesson,
		commentTeach,
		setCommentTeach,
		submit,
		goToTeacher,
		goToLesson,
		retryFromTeacher,
		isSubmitting,
	} = useEvaluateLesson(item.key);

	const content = (
		<BottomSheet onBackdropClick={isSubmitting ? undefined : onClose}>
			{/* Header */}
			<div className="mb-4">
				<p className="text-base font-bold text-app-text">Оценка занятия</p>
				<p className="text-xs text-app-muted mt-0.5 truncate">
					{item.subject} &middot; {item.teacher}
				</p>
			</div>

			{step === "success" && <EvaluateSuccessView onClose={onClose} />}

			{step === "error" && <EvaluateErrorView onRetry={retryFromTeacher} />}

			{step === "lesson" && (
				<EvaluateLessonFormView
					markLesson={markLesson}
					setMarkLesson={setMarkLesson}
					tags={tags}
					tagsLesson={tagsLesson}
					toggleLessonTag={toggleLessonTag}
					commentLesson={commentLesson}
					setCommentLesson={setCommentLesson}
					goToTeacher={goToTeacher}
				/>
			)}

			{(step === "teacher" || step === "submitting") && (
				<EvaluateTeacherFormView
					markTeach={markTeach}
					setMarkTeach={setMarkTeach}
					tags={tags}
					tagsTeach={tagsTeach}
					toggleTeachTag={toggleTeachTag}
					commentTeach={commentTeach}
					setCommentTeach={setCommentTeach}
					goToLesson={goToLesson}
					submit={submit}
					isSubmitting={isSubmitting}
				/>
			)}
		</BottomSheet>
	);

	return createPortal(content, document.body);
}
