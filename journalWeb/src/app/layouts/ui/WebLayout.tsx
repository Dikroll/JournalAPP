import { memo, useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useMidnightRefresh } from "@/app/hooks/useMidnightRefresh";
import { GlowBackground } from "@/shared/ui";
import { Sidebar } from "@/widgets/Sidebar";

export const WebLayout = memo(() => {
	const [zoom, setZoom] = useState(1);
	const mainRef = useRef<HTMLElement | null>(null);
	const location = useLocation();
	useMidnightRefresh();

	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			if (width > 1920) {
				setZoom(width / 1920);
			} else {
				setZoom(1);
			}
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	useEffect(() => {
		void location.pathname;
		mainRef.current?.scrollTo({ top: 0, left: 0 });
	}, [location.pathname]);

	return (
		<div className="bg-[var(--color-bg)] h-[100dvh] min-h-[100dvh] flex justify-start overflow-hidden relative">
			<GlowBackground useVariables />
			<div
				className='flex h-[100dvh] w-full overflow-hidden relative z-10 [&_[class*="top-bar"]]:!hidden [&_[class*="TopBar"]]:!hidden [&_[class*="bottom-bar"]]:!hidden [&_[class*="BottomBar"]]:!hidden [&_.min-h-screen]:!pb-0 [&_.min-h-screen]:min-h-[unset] [&_.pb-28]:!pb-0 [&_.pb-24]:!pb-0'
				style={{
					transform: `scale(${zoom})`,
					transformOrigin: "top left",
					width: `${100 / zoom}%`,
					height: `${100 / zoom}%`,
				}}
			>
				<div className="pt-6 pr-0 pb-2 pl-2 self-stretch shrink-0 h-full">
					<div className="h-full rounded-2xl overflow-hidden bg-[rgba(255,255,255,0.04)] backdrop-blur-[12px] border border-[var(--color-border)] will-change-transform [transform:translateZ(0)]">
						<Sidebar />
					</div>
				</div>
				<div className="flex-1 flex flex-col min-w-0 h-full pt-6 px-2 pb-2">
					<main
						ref={mainRef}
						className="flex-1 min-h-0 overflow-y-auto bg-[var(--color-bg)] rounded-3xl border border-[var(--color-border)] relative [scrollbar-width:thin] [scrollbar-color:var(--color-border)_transparent] [&::-webkit-scrollbar]:w-[0.3125rem] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--color-border-strong)] [&::-webkit-scrollbar-thumb]:rounded-[3px]"
					>
						<Outlet />
					</main>
				</div>
			</div>
		</div>
	);
});

WebLayout.displayName = "WebLayout";
