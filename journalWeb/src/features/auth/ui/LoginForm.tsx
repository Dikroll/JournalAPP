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
		<div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
			
			<div
				style={{
					position: "absolute",
					top: "-200px",
					left: "50%",
					transform: "translateX(-50%)",
					width: "700px",
					height: "500px",
					background:
						"radial-gradient(ellipse, rgba(60,63,70,0.3) 0%, transparent 70%)",
					borderRadius: "50%",
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>

			<div
				style={{
					position: "absolute",
					bottom: "-100px",
					right: "-80px",
					width: "400px",
					height: "400px",
					background:
						"radial-gradient(circle, rgba(50,53,60,0.6) 0%, transparent 70%)",
					borderRadius: "50%",
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>

			<div
				style={{
					position: "absolute",
					bottom: "-120px",
					left: "-100px",
					width: "500px",
					height: "500px",
					background:
						"radial-gradient(circle, rgba(242,5,25,0.1) 0%, rgba(242,5,25,0.04) 40%, transparent 70%)",
					borderRadius: "50%",
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>

			<div
				style={{
					position: "absolute",
					top: "-80px",
					right: "-80px",
					width: "360px",
					height: "360px",
					background:
						"radial-gradient(circle, rgba(242,5,25,0.06) 0%, transparent 65%)",
					borderRadius: "50%",
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>

			<div
				style={{
					position: "absolute",
					top: "35%",
					left: "50%",
					transform: "translateX(-50%)",
					width: "500px",
					height: "400px",
					background:
						"radial-gradient(ellipse, rgba(180,185,195,0.04) 0%, transparent 70%)",
					borderRadius: "50%",
					pointerEvents: "none",
					zIndex: 0,
				}}
			/>

			<form
	onSubmit={submit}
	className="relative z-10 w-full max-w-sm min-h-[360px] flex flex-col gap-4 bg-white/5 backdrop-blur-3xl p-8 rounded-[24px] border border-white/20 justify-center"
	style={{ boxShadow: "0 2px 6px rgba(255,255,255,0.155)" }}
>
				<div className="text-center mb-2">
					<h1 className="text-lg font-semibold text-[#F2F2F2] tracking-wide flex items-center justify-center gap-[2px]">

						<span className="bg-[#D50416] text-white py-0.5 px-[5px] rounded-[3px] text-sm font-bold">
							IT
						</span>

						<span className="relative text-[#F2F2F2] font-semibold">
							TOP

							<span
								className="absolute -top-[1px] -right-[6px] w-[14px] h-[14px] border-t-2 border-r-2 border-[#D50416]"
							/>
						</span>

						<span className="ml-[10px]">COLLEGE</span>
					</h1>

					<p className="text-xs text-[#9CA3AF] mt-1">
						Student Portal
					</p>
				</div>

				{error && (
					<p className="text-red-500 text-sm text-center">
						{error}
					</p>
				)}

				<input
					type="text"
					placeholder="Логин"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					required
					className="bg-white/5 border border-white/10 focus:border-[#D50416] outline-none rounded-lg px-3 py-2 text-sm text-[#F2F2F2] placeholder:text-[#F2F2F2] transition"
				/>

				<input
					type="password"
					placeholder="Пароль"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					className="bg-white/5 border border-white/10 focus:border-[#D50416] outline-none rounded-lg px-3 py-2 text-sm text-[#F2F2F2] placeholder:text-[#F2F2F2] transition"
				/>

				<button
					type="submit"
					disabled={loading}
					className="mt-2 bg-[#D50416] hover:bg-[#d90416] transition text-white font-medium rounded-lg px-3 py-2 text-sm disabled:opacity-50"
				>
					{loading ? "Входим..." : "Войти"}
				</button>
			</form>
		</div>
	)
}