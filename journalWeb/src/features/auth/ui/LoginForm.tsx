import { Eye, EyeOff } from 'lucide-react'
import { useLogin } from '../hooks/useLogin'

export function LoginForm() {
	const {
		username,
		password,
		showPassword,
		error,
		loading,
		setUsername,
		setPassword,
		setShowPassword,
		submit,
	} = useLogin()

	return (
		<div className='relative min-h-screen flex items-center justify-center p-4 overflow-hidden'>
			<div
				style={{
					position: 'absolute',
					top: '-200px',
					left: '50%',
					transform: 'translateX(-50%)',
					width: '700px',
					height: '500px',
					background:
						'radial-gradient(ellipse, rgba(60,63,70,0.3) 0%, transparent 70%)',
					borderRadius: '50%',
					pointerEvents: 'none',
					zIndex: 0,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: '-100px',
					right: '-80px',
					width: '400px',
					height: '400px',
					background:
						'radial-gradient(circle, rgba(50,53,60,0.6) 0%, transparent 70%)',
					borderRadius: '50%',
					pointerEvents: 'none',
					zIndex: 0,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: '-120px',
					left: '-100px',
					width: '500px',
					height: '500px',
					background:
						'radial-gradient(circle, rgba(242,5,25,0.1) 0%, rgba(242,5,25,0.04) 40%, transparent 70%)',
					borderRadius: '50%',
					pointerEvents: 'none',
					zIndex: 0,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: '-80px',
					right: '-80px',
					width: '360px',
					height: '360px',
					background:
						'radial-gradient(circle, rgba(242,5,25,0.06) 0%, transparent 65%)',
					borderRadius: '50%',
					pointerEvents: 'none',
					zIndex: 0,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					top: '35%',
					left: '50%',
					transform: 'translateX(-50%)',
					width: '500px',
					height: '400px',
					background:
						'radial-gradient(ellipse, rgba(180,185,195,0.04) 0%, transparent 70%)',
					borderRadius: '50%',
					pointerEvents: 'none',
					zIndex: 0,
				}}
			/>

			<form
				onSubmit={submit}
				className='relative z-10 w-full max-w-sm min-h-[360px] flex flex-col gap-4 bg-white/5 backdrop-blur-3xl p-8 rounded-[24px] border border-white/20 justify-center'
				style={{ boxShadow: '0 2px 6px rgba(255,255,255,0.155)' }}
			>
				<style>{`
					input::-ms-reveal,
					input::-ms-clear,
					input::-webkit-contacts-auto-fill-button,
					input::-webkit-credentials-auto-fill-button {
						display: none !important;
						visibility: hidden;
						pointer-events: none;
					}
				`}</style>
				<div className='text-center mb-2'>
					<h1 className='text-lg font-semibold text-[#F2F2F2] tracking-wide flex items-center justify-center gap-[2px]'>
						<span className='bg-[#D50416] text-white py-0.5 px-[5px] rounded-[3px] text-sm font-bold'>
							IT
						</span>
						<span className='relative text-[#F2F2F2] font-semibold'>
							TOP
							<span className='absolute -top-[1px] -right-[6px] w-[14px] h-[14px] border-t-2 border-r-2 border-[#D50416]' />
						</span>
						<span className='ml-[10px]'>COLLEGE</span>
					</h1>
					<p className='text-xs text-[#9CA3AF] mt-1'>Student Portal</p>
				</div>

				{error && (
					<div className='flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2'>
						<svg
							className='shrink-0 text-red-400'
							width='14'
							height='14'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
						>
							<circle cx='12' cy='12' r='10' />
							<line x1='12' y1='8' x2='12' y2='12' />
							<line x1='12' y1='16' x2='12.01' y2='16' />
						</svg>
						<p className='text-red-400 text-xs'>{error}</p>
					</div>
				)}

				<input
					type='text'
					placeholder='Логин'
					value={username}
					onChange={e => setUsername(e.target.value)}
					autoComplete='username'
					name='username'
					required
					className='bg-white/5 border border-white/10 focus:border-[#D50416] outline-none rounded-lg px-3 py-2 text-sm text-[#F2F2F2] placeholder:text-[#9CA3AF] transition'
				/>

				<div className='relative'>
					<input
						type={showPassword ? 'text' : 'password'}
						placeholder='Пароль'
						value={password}
						onChange={e => setPassword(e.target.value)}
						autoComplete='current-password'
						name='password'
						required
						className='w-full bg-white/5 border border-white/10 focus:border-[#D50416] outline-none rounded-lg px-3 py-2 pr-10 text-sm text-[#F2F2F2] placeholder:text-[#9CA3AF] transition'
					/>
					<button
						type='button'
						onClick={() => setShowPassword(!showPassword)}
						className='absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] transition-colors'
						tabIndex={-1}
					>
						{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
					</button>
				</div>

				<button
					type='submit'
					disabled={loading}
					className='mt-2 bg-[#D50416] hover:bg-[#b8030f] transition text-white font-medium rounded-lg px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed'
				>
					{loading ? (
						<span className='flex items-center justify-center gap-2'>
							<svg
								className='animate-spin'
								width='14'
								height='14'
								viewBox='0 0 24 24'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
							>
								<path d='M21 12a9 9 0 1 1-6.219-8.56' />
							</svg>
							Входим...
						</span>
					) : (
						'Войти'
					)}
				</button>
			</form>
		</div>
	)
}
