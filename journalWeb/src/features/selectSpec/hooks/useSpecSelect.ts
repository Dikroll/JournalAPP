import { useCallback, useEffect, useRef, useState } from "react";
import type { Subject } from "@/entities/subject";

interface Params {
	subjects: Subject[];
	selectedId: number | null;
	onChange: (subject: Subject | null) => void;
}

export function useSpecSelector({ subjects, selectedId, onChange }: Params) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");

	const ref = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const shouldFocusInput = useRef(false);

	const close = useCallback(() => {
		setOpen(false);
		setSearch("");
	}, []);

	const selected = subjects.find((s) => s.id === selectedId) ?? null;

	const filtered = subjects.filter(
		(s) =>
			s.name.toLowerCase().includes(search.toLowerCase()) ||
			s.short_name.toLowerCase().includes(search.toLowerCase()),
	);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) close();
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, [close]);

	useEffect(() => {
		if (open && inputRef.current && shouldFocusInput.current) {
			inputRef.current.focus();
		}
	}, [open]);

	const openWithFocus = () => {
		shouldFocusInput.current = true;
		setOpen(true);
	};

	const toggleWithoutFocus = () => {
		shouldFocusInput.current = false;
		open ? close() : setOpen(true);
	};

	const handleSelect = (subject: Subject | null) => {
		onChange(subject);
		setSearch("");
		close();
	};

	const handleClear = () => {
		onChange(null);
		setSearch("");
	};

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
	};
}
