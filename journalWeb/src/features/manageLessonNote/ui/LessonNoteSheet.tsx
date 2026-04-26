import {
	type LessonNote,
	type NoteStatus,
	useLessonNotesStore,
	makeLessonKey,
	getNotesForKey,
} from '@/entities/schedule'
import { BottomSheet, SheetButton } from '@/shared/ui'
import { StickyNote, Trash2, Pencil, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
	date: string
	lessonNumber: number
	subjectName: string
	onClose: () => void
}

function StatusPicker({
	statuses,
	selected,
	onSelect,
}: {
	statuses: NoteStatus[]
	selected: NoteStatus
	onSelect: (s: NoteStatus) => void
}) {
	return (
		<div className='flex flex-wrap gap-2'>
			{statuses.map(status => {
				const active = selected.label === status.label
				return (
					<button
						key={status.label}
						type='button'
						onClick={() => onSelect(status)}
						className='px-3 py-1.5 rounded-full text-xs font-medium transition-all'
						style={{
							background: active
								? `${status.color}15`
								: 'var(--color-surface-strong)',
							border: active
								? `1.5px solid ${status.color}40`
								: '1px solid var(--color-border)',
							color: active ? status.color : 'var(--color-text-muted)',
						}}
					>
						{status.label}
					</button>
				)
			})}
		</div>
	)
}

function NoteItem({
	note,
	lessonKey,
	onEdit,
}: {
	note: LessonNote
	lessonKey: string
	onEdit: (n: LessonNote) => void
}) {
	const removeNote = useLessonNotesStore(s => s.removeNote)

	return (
		<div
			className='flex items-start gap-2 rounded-xl px-3 py-2.5 border'
			style={{
				background: `${note.status.color}08`,
				borderColor: `${note.status.color}20`,
			}}
		>
			<span
				className='text-[10px] font-semibold rounded-full px-2 py-0.5 shrink-0 mt-0.5'
				style={{
					background: `${note.status.color}15`,
					color: note.status.color,
				}}
			>
				{note.status.label}
			</span>
			<p className='text-xs text-app-text flex-1 leading-relaxed'>
				{note.text}
			</p>
			<div className='flex gap-1 shrink-0'>
				<button
					type='button'
					onClick={() => onEdit(note)}
					className='p-1 rounded-md text-app-faint hover:text-app-muted transition-colors'
				>
					<Pencil size={11} />
				</button>
				<button
					type='button'
					onClick={() => removeNote(lessonKey, note.id)}
					className='p-1 rounded-md text-app-faint hover:text-status-overdue transition-colors'
				>
					<Trash2 size={11} />
				</button>
			</div>
		</div>
	)
}

export function LessonNoteSheet({
	date,
	lessonNumber,
	subjectName,
	onClose,
}: Props) {
	const lessonKey = makeLessonKey(date, lessonNumber)
	const existingNotes = useLessonNotesStore(
		useCallback((s) => getNotesForKey(s.notes, lessonKey), [lessonKey]),
	)
	const statuses = useLessonNotesStore(s => s.statuses)
	const addNote = useLessonNotesStore(s => s.addNote)
	const updateNote = useLessonNotesStore(s => s.updateNote)

	const [text, setText] = useState('')
	const [selectedStatus, setSelectedStatus] = useState<NoteStatus>(statuses[0])
	const [editingNote, setEditingNote] = useState<LessonNote | null>(null)

	const handleStartEdit = (note: LessonNote) => {
		setEditingNote(note)
		setText(note.text)
		setSelectedStatus(note.status)
	}

	const handleCancelEdit = () => {
		setEditingNote(null)
		setText('')
		setSelectedStatus(statuses[0])
	}

	const handleSave = () => {
		if (!text.trim()) return
		if (editingNote) {
			updateNote(lessonKey, editingNote.id, {
				text: text.trim(),
				status: selectedStatus,
			})
			setEditingNote(null)
		} else {
			addNote(date, lessonNumber, text.trim(), selectedStatus)
		}
		setText('')
		setSelectedStatus(statuses[0])
	}

	const content = (
		<BottomSheet onBackdropClick={onClose}>
			{/* Header */}
			<div className='mb-4'>
				<div className='flex items-center gap-2'>
					<StickyNote size={14} className='text-brand' />
					<p className='text-base font-bold text-app-text'>Заметки к паре</p>
				</div>
				<p className='text-xs text-app-muted mt-0.5 truncate'>
					{subjectName}
				</p>
			</div>

			<div className='space-y-4'>
				{/* Existing notes list */}
				{existingNotes.length > 0 && (
					<div className='flex flex-col gap-2'>
						{existingNotes.map(note => (
							<NoteItem
								key={note.id}
								note={note}
								lessonKey={lessonKey}
								onEdit={handleStartEdit}
							/>
						))}
					</div>
				)}

				{/* Add / Edit form */}
				<div className='space-y-3'>
					{editingNote && (
						<div className='flex items-center justify-between'>
							<p className='text-xs text-brand font-medium'>
								Редактирование
							</p>
							<button
								type='button'
								onClick={handleCancelEdit}
								className='p-1 rounded-md text-app-faint hover:text-app-muted'
							>
								<X size={14} />
							</button>
						</div>
					)}

					<StatusPicker
						statuses={statuses}
						selected={selectedStatus}
						onSelect={setSelectedStatus}
					/>

					<textarea
						value={text}
						onChange={e => setText(e.target.value)}
						placeholder='Например: принести тетрадь, доделать лабу...'
						maxLength={300}
						rows={2}
						className='w-full rounded-2xl px-4 py-3 text-sm text-app-text placeholder:text-app-faint resize-none focus:outline-none'
						style={{
							background: 'var(--color-surface-strong)',
							border: '1px solid var(--color-border)',
						}}
					/>

					<SheetButton
						variant='primary'
						onClick={handleSave}
						disabled={!text.trim()}
					>
						{editingNote ? 'Сохранить' : 'Добавить заметку'}
					</SheetButton>
				</div>
			</div>
		</BottomSheet>
	)

	return createPortal(content, document.body)
}
