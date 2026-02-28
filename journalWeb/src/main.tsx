import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./app/App.tsx"
import "@/shared/styles/index.css" // добавь эту строку
const rootElement = document.getElementById("root");
if (rootElement) {
	createRoot(rootElement).render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}
