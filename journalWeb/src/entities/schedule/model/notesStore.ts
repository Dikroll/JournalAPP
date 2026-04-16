import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface NoteStatus {
	label: string
	color: string
}

export const DEFAULT_STATUSES: NoteStatus[] = [
	{ label: 'Принести', color: '#F59E0B' },
	{ label: 'Доделать', color: '#3B82F6' },
	{ label: 'Важно', color: '#EF4444' },
	{ label: 'Заметка', color: '#8B5CF6' },
]

export interface LessonNote {
	id: string
	text: string
	status: NoteStatus
	createdAt: number
}

interface NotesState {
	notes: Record<string, LessonNote[]>
	statuses: NoteStatus[]

	addNote: (
		date: string,
		lesson: number,
		text: string,
		status: NoteStatus,
	) => void
	updateNote: (
		lessonKey: string,
		noteId: string,
		updates: Partial<Pick<LessonNote, 'text' | 'status'>>,
	) => void
	removeNote: (lessonKey: string, noteId: string) => void
	addStatus: (status: NoteStatus) => void
	removeStatus: (label: string) => void
}

let _counter = Date.now()

function makeLessonKey(date: string, lesson: number) {
	return `${date}_${lesson}`
}

const EMPTY_NOTES: LessonNote[] = []

function getNotesForKey(
	notes: Record<string, LessonNote[] | LessonNote>,
	key: string,
): LessonNote[] {
	const val = notes[key]
	if (!val) return EMPTY_NOTES
	if (Array.isArray(val)) return val
	if (typeof val === 'object' && 'id' in val) return [val as LessonNote]
	return EMPTY_NOTES
}

export const useLessonNotesStore = create<NotesState>()(
	persist(
		(set, get) => ({
			notes: {},
			statuses: DEFAULT_STATUSES,

			addNote: (date, lesson, text, status) => {
				const key = makeLessonKey(date, lesson)
				const id = `${key}_${++_counter}`
				set(state => ({
					notes: {
						...state.notes,
						[key]: [
							...(state.notes[key] ?? []),
							{ id, text, status, createdAt: Date.now() },
						],
					},
				}))
			},

			updateNote: (lessonKey, noteId, updates) => {
				const list = get().notes[lessonKey]
				if (!list) return
				set(state => ({
					notes: {
						...state.notes,
						[lessonKey]: list.map(n =>
							n.id === noteId ? { ...n, ...updates } : n,
						),
					},
				}))
			},

			removeNote: (lessonKey, noteId) => {
				set(state => {
					const list = (state.notes[lessonKey] ?? []).filter(
						n => n.id !== noteId,
					)
					if (list.length === 0) {
						const { [lessonKey]: _, ...rest } = state.notes
						return { notes: rest }
					}
					return { notes: { ...state.notes, [lessonKey]: list } }
				})
			},

			addStatus: (status) => {
				set(state => ({
					statuses: [...state.statuses, status],
				}))
			},

			removeStatus: (label) => {
				set(state => ({
					statuses: state.statuses.filter(s => s.label !== label),
				}))
			},
		}),
		{
			name: 'lesson-notes-store',
			version: 1,
			partialize: state => ({
				notes: state.notes,
				statuses: state.statuses,
			}),
			migrate: (persisted, version) => {
				if (version === 0) {
					const old = persisted as {
						notes?: Record<string, unknown>
						statuses?: NoteStatus[]
					}
					const migrated: Record<string, LessonNote[]> = {}
					if (old.notes) {
						for (const [key, val] of Object.entries(old.notes)) {
							if (Array.isArray(val)) {
								migrated[key] = val
							} else if (val && typeof val === 'object' && 'id' in val) {
								migrated[key] = [val as LessonNote]
							}
						}
					}
					return { ...old, notes: migrated }
				}
				return persisted as NotesState
			},
		},
	),
)

export { makeLessonKey, getNotesForKey }
