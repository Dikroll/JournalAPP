import { useRef } from 'react'
import { useCatGame } from './useCatGame'

export function CatGame() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const { jump } = useCatGame(canvasRef)

	return (
		<canvas
			ref={canvasRef}
			className='w-full h-full block cursor-pointer select-none rounded-2xl'
			onClick={jump}
		/>
	)
}
