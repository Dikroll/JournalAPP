import { useLogin } from "../hooks/useLogin"

export function LoginForm() {
	const {
		username,
		password,
		error,
		loading,
		setUsername,
		setPassword,
		submit,
	} = useLogin()

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] p-4">
			<form
				onSubmit={submit}
				className="w-full max-w-sm flex flex-col gap-4 bg-white/5 backdrop-blur-xl p-8 rounded-[24px] border border-white/10"
				style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
			>
				<div className="text-center mb-2">
					<h1 className="text-lg font-semibold text-[#F2F2F2] tracking-wide">
						IT <span className="text-[#F20519]">TOP</span> COLLEGE
					</h1>
					<p className="text-xs text-[#9CA3AF] mt-1">Student Portal</p>
				</div>

				{error && <p className="text-red-500 text-sm text-center">{error}</p>}

				<input
					type="text"
					placeholder="Логин"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					required
					className="bg-white/5 border border-white/10 focus:border-[#F20519] outline-none rounded-lg px-3 py-2 text-sm text-[#F2F2F2] placeholder:text-[#9CA3AF] transition"
				/>

				<input
					type="password"
					placeholder="Пароль"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					className="bg-white/5 border border-white/10 focus:border-[#F20519] outline-none rounded-lg px-3 py-2 text-sm text-[#F2F2F2] placeholder:text-[#9CA3AF] transition"
				/>

				<button
					type="submit"
					disabled={loading}
					className="mt-2 bg-[#F20519] hover:bg-[#d90416] transition text-white font-medium rounded-lg px-3 py-2 text-sm disabled:opacity-50"
				>
					{loading ? "Входим..." : "Войти"}
				</button>
			</form>
		</div>
	)
}