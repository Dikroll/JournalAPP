import { pageConfig } from '@/shared/config'
import { memo } from 'react'
import { Link } from 'react-router-dom'

interface Props {
	className?: string
	size?: 'sm' | 'md'
	onClick?: () => void
	as?: 'link' | 'div' | 'h1'
}

export const BrandLogo = memo(({ className = '', size = 'md', as = 'link', onClick }: Props) => {
	const isSm = size === 'sm'

	const containerClasses = `flex items-center tracking-wide leading-none select-none focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 rounded-sm ${isSm ? 'text-[13px] gap-[3px]' : 'text-base gap-[2px]'} font-semibold text-app-text ${className}`

	const inner = (
		<>
			<span
				className={`bg-brand text-white rounded-[3px] font-bold ${isSm ? 'py-[2px] px-[5px] text-[11px]' : 'py-0.5 px-[5px] text-sm'}`}
			>
				IT
			</span>
			<span className='relative text-app-text font-semibold'>
				TOP
				{!isSm && (
					<span className='absolute -top-[1px] -right-[6px] w-[14px] h-[14px] border-t-2 border-r-2 border-brand' />
				)}
			</span>
			<span className={`${isSm ? 'ml-[4px] text-app-muted' : 'ml-[10px]'}`}>COLLEGE</span>
		</>
	)

	if (as === 'h1') {
		return (
			<h1 className={containerClasses} onClick={onClick}>
				{inner}
			</h1>
		)
	}

	if (as === 'div') {
		return (
			<div className={containerClasses} onClick={onClick}>
				{inner}
			</div>
		)
	}

	return (
		<Link to={pageConfig.home} className={containerClasses} onClick={onClick}>
			{inner}
		</Link>
	)
})

BrandLogo.displayName = 'BrandLogo'
