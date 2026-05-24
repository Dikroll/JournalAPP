import type { Subject } from '@/entities/subject'
import { useEffect, useRef } from 'react'
import { useSpecSelectorStore } from '../models/store'

interface Params {
	subjects: Subject[]
	selectedId: number | null
	onChange: (subject: Subject | null) => void
}

export function useSpecSelector({ subjects, selectedId, onChange }: Params) {
	const { open, search, setOpen, setSearch, close } = useSpecSelectorStore()

	const ref = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const shouldFocusInput = useRef(false)

	const selected = subjects.find(s => s.id === selectedId) ?? null

	const filtered = subjects.filter(
		s =>
			s.name.toLowerCase().includes(search.toLowerCase()) ||
			s.short_name.toLowerCase().includes(search.toLowerCase()),
	)

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) close()
		}
		document.addEventListener('mousedown', handler)
		return () => document.removeEventListener('mousedown', handler)
	}, [close])

	useEffect(() => {
		if (!open) return

		const onBack = () => close()

		window.addEventListener('popstate', onBack)
		history.pushState({ specSelector: true }, '')

		return () => {
			window.removeEventListener('popstate', onBack)
			if (history.state?.specSelector) history.back()
		}
	}, [open, close])

	useEffect(() => {
		if (open && inputRef.current && shouldFocusInput.current) {
			inputRef.current.focus()
		}
	}, [open])

	const openWithFocus = () => {
		shouldFocusInput.current = true
		setOpen(true)
	}

	const toggleWithoutFocus = () => {
		shouldFocusInput.current = false
		open ? close() : setOpen(true)
	}

	const handleSelect = (subject: Subject | null) => {
		onChange(subject)
		close()
	}

	const handleClear = () => {
		onChange(null)
		setSearch('')
	}

	return {
		ref,
		inputRef,
		open,
		search,
		selected,
		filtered,

		setSearch,
		openWithFocus,
		toggleWithoutFocus,
		handleSelect,
		handleClear,
	}
}
