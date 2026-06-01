import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface BottomSheetProps {
	children: ReactNode;
	onBackdropClick?: () => void;
	zIndex?: number;
	maxWidth?: string;
}

export function BottomSheet({
	children,
	onBackdropClick,
	zIndex = 200,
	maxWidth,
}: BottomSheetProps) {
	const [dragY, setDragY] = useState(0)
	const [dragging, setDragging] = useState(false)
	const dragStart = useRef(0)
	const sheetRef = useRef<HTMLDivElement>(null)
	const isDesktop = useIsDesktop()

	useEffect(() => {
		const scrollY = window.scrollY;
		const { body } = document;
		body.style.position = "fixed";
		body.style.top = `-${scrollY}px`;
		body.style.left = "0";
		body.style.right = "0";
		body.style.overflow = "hidden";
		return () => {
			body.style.position = "";
			body.style.top = "";
			body.style.left = "";
			body.style.right = "";
			body.style.overflow = "";
			window.scrollTo(0, scrollY);
		};
	}, []);

	const dismiss = useCallback(() => {
		onBackdropClick?.();
	}, [onBackdropClick]);

	const onTouchStart = useCallback((e: React.TouchEvent) => {
		if (isDesktop) return
		const sheet = sheetRef.current
		if (!sheet) return
		const rect = sheet.getBoundingClientRect()
		const touchY = e.touches[0].clientY
		if (touchY - rect.top > 40) return
		dragStart.current = touchY
		setDragging(true)
	}, [isDesktop])

	const onTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (!dragging) return;
			const d = e.touches[0].clientY - dragStart.current;
			if (d > 0) setDragY(d);
		},
		[dragging],
	);

	const onTouchEnd = useCallback(() => {
		if (!dragging) return;
		setDragging(false);
		if (dragY > 80) {
			dismiss();
		}
		setDragY(0);
	}, [dragging, dragY, dismiss]);

	return (
		<div
			className={`fixed inset-0 flex justify-center ${isDesktop ? 'items-center p-4' : 'items-end'}`}
			style={{
				background: "var(--color-modal-backdrop)",
				backdropFilter: "blur(4px)",
				zIndex,
			}}
			onClick={onBackdropClick}
		>
			<div
				ref={sheetRef}
				className={`w-full ${maxWidth ?? 'max-w-md'} ${isDesktop ? 'rounded-[28px] border max-h-[90vh] overflow-y-auto' : 'rounded-t-[28px] border-t border-x'} p-5 border-app-border`}
				style={{
					background: "var(--color-modal-bg)",
					transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
					transition: dragging ? 'none' : 'transform 0.2s ease-out',
					boxShadow: isDesktop ? 'var(--shadow-modal)' : undefined,
				}}
				onClick={(e) => e.stopPropagation()}
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onTouchEnd={onTouchEnd}
			>
				{!isDesktop && <div className='w-10 h-1 bg-glass-strong rounded-full mx-auto mb-4 cursor-grab' />}
				{children}
			</div>
		</div>
	);
}
