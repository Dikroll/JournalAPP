import { Component, type ReactNode } from "react";
import { isNativeRuntime } from "@/shared/lib/platform";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	retried: boolean;
	showErrorUI: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
	state: State = { hasError: false, retried: false, showErrorUI: false };
	private timeoutId: ReturnType<typeof setTimeout> | null = null;

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	componentDidCatch(error: unknown) {
		console.error("React ErrorBoundary caught an error:", error);
		this.timeoutId = setTimeout(() => {
			this.setState({ showErrorUI: true });
		}, 1000);
	}

	componentWillUnmount() {
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}
	}

	handleClearAndLogin = () => {
		try {
			localStorage.clear();
		} catch {}
		window.location.assign(isNativeRuntime ? "#/login" : "/login");
	};

	handleRetry = () => {
		this.setState({ hasError: false, retried: true, showErrorUI: false });
	};

	render() {
		if (!this.state.hasError) return this.props.children;
		if (this.state.hasError && !this.state.showErrorUI) return this.props.fallback ?? null;

		return (
			<div
				className="min-h-screen flex items-center justify-center text-app-text px-4"
				style={{ backgroundColor: "var(--color-bg, #1F2024)" }}
			>
				<div
					className="w-full max-w-sm rounded-[24px] border border-app-border bg-app-surface p-5 text-center"
					style={{ boxShadow: "var(--shadow-card)" }}
				>
					<p className="text-base font-semibold">Страница не загрузилась</p>
					<p className="text-sm text-app-muted mt-2">
						Попробуйте обновить страницу или вернуться на главную.
						{this.state.retried && (
							<>
								<br />
								Если проблема повторяется, нажмите «Сбросить данные».
							</>
						)}
					</p>
					<div className={`grid ${this.state.retried ? "grid-cols-3" : "grid-cols-2"} gap-2 mt-4`}>
						<button
							type="button"
							className="rounded-xl bg-app-surface-hover border border-app-border px-3 py-2 text-sm font-semibold text-app-text"
							onClick={this.handleRetry}
						>
							Обновить
						</button>
						<button
							type="button"
							className="rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white"
							onClick={() => window.location.assign(isNativeRuntime ? "#/" : "/")}
						>
							На главную
						</button>
						{this.state.retried && (
							<button
								type="button"
								className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white"
								onClick={this.handleClearAndLogin}
							>
								Сбросить
							</button>
						)}
					</div>
				</div>
			</div>
		);
	}
}
