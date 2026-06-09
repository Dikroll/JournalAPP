import { useEffect, useState } from "react";

/**
 * Возвращает true если устройство является десктопом или планшетом.
 * Реактивно обновляется при изменении размера окна.
 */
export function useIsDesktop(): boolean {
	const checkIsDesktop = () => {
		if (typeof window === "undefined") return false;
		
		// Определяем минимальную сторону экрана. У телефонов она всегда меньше 768px.
		const minDimension = Math.min(window.screen.width, window.screen.height);
		const isPhoneSize = minDimension < 768;

		// Если это телефон, не показываем ПК-версию даже в горизонтальном положении
		if (isPhoneSize) return false;

		return window.innerWidth >= 768;
	};

	const [isDesktop, setIsDesktop] = useState<boolean>(checkIsDesktop);

	useEffect(() => {
		// Попытка заблокировать ориентацию через Web API (работает в PWA)
		try {
			if (screen.orientation && typeof (screen.orientation as any).lock === 'function') {
				(screen.orientation as any).lock('portrait').catch(() => {});
			}
		} catch (e) {}

		const handleResize = () => setIsDesktop(checkIsDesktop());
		
		window.addEventListener("resize", handleResize);
		window.addEventListener("orientationchange", handleResize);
		
		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("orientationchange", handleResize);
		};
	}, []);

	return isDesktop;
}
