import { useEffect, useState } from "react";

/**
 * Возвращает true если ширина экрана >= 768px (десктоп/планшет).
 * Реактивно обновляется при изменении размера окна.
 */
export function useIsDesktop(): boolean {
	const [isDesktop, setIsDesktop] = useState<boolean>(
		() => typeof window !== "undefined" && window.innerWidth >= 768,
	);

	useEffect(() => {
		const mq = window.matchMedia("(min-width: 768px)");
		setIsDesktop(mq.matches);

		const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	return isDesktop;
}
