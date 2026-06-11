import { BookOpen, Loader2, User } from "lucide-react";
import type { FeedbackTag } from "@/entities/feedback";
import { SheetButton, StarRating, SuccessStateView } from "@/shared/ui";
import { EvaluateTagPicker } from "./EvaluateTagPicker";

export function EvaluateSuccessView({ onClose }: { onClose: () => void }) {
	return (
		<>
			<SuccessStateView
				title="Спасибо за оценку!"
				subtitle="Ваш отзыв поможет улучшить качество занятий"
			/>
			<div className="mt-2">
				<SheetButton onClick={onClose}>Закрыть</SheetButton>
			</div>
		</>
	);
}

export function EvaluateErrorView({ onRetry }: { onRetry: () => void }) {
	return (
		<div className="flex flex-col items-center py-6 gap-3">
			<p className="text-sm font-semibold text-status-overdue">
				Не удалось отправить оценку
			</p>
			<p className="text-xs text-app-muted">Попробуйте ещё раз</p>
			<SheetButton variant="primary" onClick={onRetry}>
				Повторить
			</SheetButton>
		</div>
	);
}

export function EvaluateLessonFormView({
	markLesson,
	setMarkLesson,
	tags,
	tagsLesson,
	toggleLessonTag,
	commentLesson,
	setCommentLesson,
	goToTeacher,
}: {
	markLesson: number;
	setMarkLesson: (v: number) => void;
	tags: FeedbackTag[];
	tagsLesson: Set<number>;
	toggleLessonTag: (id: number) => void;
	commentLesson: string;
	setCommentLesson: (v: string) => void;
	goToTeacher: () => void;
}) {
	return (
		<div className="space-y-5">
			<div>
				<div className="flex items-center gap-2 mb-3">
					<BookOpen size={14} className="text-brand" />
					<p className="text-sm font-semibold text-app-text">Занятие</p>
				</div>
				<StarRating value={markLesson} onChange={setMarkLesson} />
			</div>

			{tags.length > 0 && (
				<div>
					<p className="text-xs text-app-muted mb-2">Теги (необязательно)</p>
					<EvaluateTagPicker
						tags={tags}
						selected={tagsLesson}
						onToggle={toggleLessonTag}
					/>
				</div>
			)}

			<div>
				<p className="text-xs text-app-muted mb-2">
					Комментарий (необязательно)
				</p>
				<textarea
					value={commentLesson}
					onChange={(e) => setCommentLesson(e.target.value)}
					placeholder="Что понравилось или не понравилось?"
					maxLength={500}
					rows={2}
					className="w-full rounded-3xl px-4 py-3 text-sm text-app-text placeholder:text-app-faint resize-none focus:outline-none"
					style={{
						background: "var(--color-surface-strong)",
						border: "1px solid var(--color-border)",
					}}
				/>
			</div>

			<SheetButton
				variant="primary"
				onClick={goToTeacher}
				disabled={markLesson === 0}
			>
				Далее — оценка преподавателя
			</SheetButton>
		</div>
	);
}

export function EvaluateTeacherFormView({
	markTeach,
	setMarkTeach,
	tags,
	tagsTeach,
	toggleTeachTag,
	commentTeach,
	setCommentTeach,
	goToLesson,
	submit,
	isSubmitting,
}: {
	markTeach: number;
	setMarkTeach: (v: number) => void;
	tags: FeedbackTag[];
	tagsTeach: Set<number>;
	toggleTeachTag: (id: number) => void;
	commentTeach: string;
	setCommentTeach: (v: string) => void;
	goToLesson: () => void;
	submit: () => void;
	isSubmitting: boolean;
}) {
	return (
		<div className="space-y-5">
			<div>
				<div className="flex items-center gap-2 mb-3">
					<User size={14} className="text-brand" />
					<p className="text-sm font-semibold text-app-text">Преподаватель</p>
				</div>
				<StarRating
					value={markTeach}
					onChange={isSubmitting ? () => {} : setMarkTeach}
				/>
			</div>

			{tags.length > 0 && (
				<div>
					<p className="text-xs text-app-muted mb-2">Теги (необязательно)</p>
					<EvaluateTagPicker
						tags={tags}
						selected={tagsTeach}
						onToggle={isSubmitting ? () => {} : toggleTeachTag}
						disabled={isSubmitting}
					/>
				</div>
			)}

			<div>
				<p className="text-xs text-app-muted mb-2">
					Комментарий (необязательно)
				</p>
				<textarea
					value={commentTeach}
					onChange={(e) => setCommentTeach(e.target.value)}
					disabled={isSubmitting}
					placeholder="Как вам преподаватель?"
					maxLength={500}
					rows={2}
					className="w-full rounded-3xl px-4 py-3 text-sm text-app-text placeholder:text-app-faint resize-none focus:outline-none disabled:opacity-60"
					style={{
						background: "var(--color-surface-strong)",
						border: "1px solid var(--color-border)",
					}}
				/>
			</div>

			<div className="flex gap-2">
				<div className="flex-1">
					<SheetButton onClick={goToLesson} disabled={isSubmitting}>
						Назад
					</SheetButton>
				</div>
				<div className="flex-1">
					<SheetButton
						variant="primary"
						onClick={submit}
						disabled={markTeach === 0 || isSubmitting}
					>
						{isSubmitting ? (
							<span className="flex items-center justify-center gap-2">
								<Loader2 size={16} className="animate-spin" />
								Отправка
							</span>
						) : (
							"Отправить"
						)}
					</SheetButton>
				</div>
			</div>
		</div>
	);
}
