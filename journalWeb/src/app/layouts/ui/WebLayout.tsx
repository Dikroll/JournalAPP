import { memo } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/widgets/Sidebar";
import "./WebLayout.css";

/**
 * WebLayout — лейаут для десктопа (ширина >= 768px).
 *
 * Структура:
 *   ┌──────────┬────────────────────────┐
 *   │          │  TopBar                │
 *   │ Sidebar  ├────────────────────────┤
 *   │          │  <Outlet /> (страница) │
 *   └──────────┴────────────────────────┘
 *
 * Страницы рендерятся через <Outlet /> — те же что и на мобиле,
 * никаких изменений в pages/* не нужно.
 */
export const WebLayout = memo(() => {
	return (
		<div className="web-layout-wrapper">
			<div className="web-layout container mx-auto 2xl:max-w-[1536px]">
				<div className="web-layout__sidebar-wrapper">
					<div className="web-layout__sidebar-inner">
						<Sidebar />
					</div>
				</div>
				<div className="web-layout__main-wrapper">
					<main className="web-layout__content">
						<Outlet />
					</main>
				</div>
			</div>
		</div>
	);
});

WebLayout.displayName = "WebLayout";
