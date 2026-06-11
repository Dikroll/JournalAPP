import { useEffect, useRef } from "react";

export function useCloseOnOutsideClick<T extends HTMLElement>(
	isOpen: boolean,
	onClose: () => void,
) {
	const ref = useRef<T | null>(null);

	useEffect(() => {
		if (!isOpen) return;

		const handlePointerDown = (event: PointerEvent) => {
			if (!ref.current?.contains(event.target as Node)) {
				onClose();
			}
		};

		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [isOpen, onClose]);

	return ref;
}
