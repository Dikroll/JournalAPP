import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { authApi } from "../api"
import { useAuthStore } from "../model/store"

export function LoginForm() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const setToken = useAuthStore((s) => s.setToken);
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const { access_token } = await authApi.login({ username, password });
			setToken(access_token);
			navigate("/");
		} catch (err: unknown) {
			const msg =
				(err as { response?: { data?: { detail?: string } } })?.response?.data
					?.detail ?? "Ошибка входа";
			setError(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<form
				onSubmit={handleSubmit}
				className="w-full max-w-sm flex flex-col gap-3"
			>
				<h1 className="text-xl font-bold text-center">Вход</h1>
				{error && <p className="text-red-500 text-sm text-center">{error}</p>}
				<input
					type="text"
					placeholder="Логиpppн"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					required
					className="border rounded px-3 py-2 text-sm"
				/>
				<input
					type="password"
					placeholder="Пароль"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					className="border rounded px-3 py-2 text-sm"
				/>
				<button
					type="submit"
					disabled={loading}
					className="bg-blue-600 text-white rounded px-3 py-2 text-sm disabled:opacity-50"
				>
					{loading ? "Входим..." : "Войти"}
				</button>
			</form>
		</div>
	);
}
