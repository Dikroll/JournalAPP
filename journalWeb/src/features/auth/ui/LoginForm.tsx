import { GlowBackground } from '@/shared/ui'
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
		<div
			className='relative flex items-start justify-center p-4'
			style={{
				width: '100%',
				height: '100dvh',
				overflow: 'hidden',
				paddingTop: 'max(env(safe-area-inset-top), 0px)',
				paddingBottom: 'max(env(safe-area-inset-bottom), 0px)',
				backgroundColor: 'var(--color-bg)',
			}}
		>
			<GlowBackground />

			<div
				className='relative z-10 w-full max-w-sm'
				style={{ marginTop: 'calc(38.2dvh - 180px)' }}
			>
				<form
					onSubmit={submit}
					className='w-full min-h-[360px] flex flex-col gap-4 bg-glass backdrop-blur-3xl p-8 rounded-[24px] border border-glass-strong justify-center'
					style={{ boxShadow: '0 2px 6px rgba(255,255,255,0.155)' }}
				>
					<style>{`
						input::-ms-reveal, input::-ms-clear,
						input::-webkit-contacts-auto-fill-button,
						input::-webkit-credentials-auto-fill-button {
							display: none !important; visibility: hidden; pointer-events: none;
						}
					`}</style>
					<div className='text-center mb-2'>
						<h1 className='text-lg font-semibold text-app-text tracking-wide flex items-center justify-center gap-[2px]'>
							<span className='bg-brand text-white py-0.5 px-[5px] rounded-[3px] text-sm font-bold'>
								IT
							</span>
							<span className='relative text-app-text font-semibold'>
								TOP
								<span className='absolute -top-[1px] -right-[6px] w-[14px] h-[14px] border-t-2 border-r-2 border-brand' />
							</span>
							<span className='ml-[10px]'>COLLEGE</span>
						</h1>
						<p className='text-xs text-app-muted mt-1'>Student Portal</p>
					</div>

					{error && (
						<div className='flex items-center gap-2 bg-danger-subtle border border-danger-border rounded-lg px-3 py-2'>
							<svg
								className='shrink-0 text-danger'
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
							<p className='text-danger text-xs'>{error}</p>
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
						className='bg-glass border border-glass-border focus:border-brand outline-none rounded-lg px-3 py-2 text-sm text-app-text placeholder:text-app-muted transition'
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
							className='w-full bg-glass border border-glass-border focus:border-brand outline-none rounded-lg px-3 py-2 pr-10 text-sm text-app-text placeholder:text-app-muted transition'
						/>
						<button
							type='button'
							onClick={e => {
								e.preventDefault()
								setShowPassword(!showPassword)
							}}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-app-muted hover:text-app-text'
							tabIndex={-1}
						>
							{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
						</button>
					</div>

					<button
						type='submit'
						disabled={loading}
						className='mt-2 bg-brand hover:bg-brand/90 transition text-white font-medium rounded-lg px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed'
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
		</div>
	)
}
