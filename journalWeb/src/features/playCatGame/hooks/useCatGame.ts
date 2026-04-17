import { useEffect, useRef } from 'react'
import type { World } from '../lib/types'
import { GW, GH, CAT_FLOOR } from '../lib/constants'
import {
	mkWorld,
	applyCatJump,
	updateCatPhysics,
	updateSpeed,
	spawnDogs,
	updateDogs,
	checkCollisions,
} from '../lib/gameLogic'
import {
	drawSky,
	drawStars,
	drawCloud,
	drawGround,
	drawHUD,
	drawCat,
	drawRunner,
	drawJumper,
	drawGameOver,
	drawIdleHint,
} from '../lib/draw'

export function useCatGame(
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
	const world = useRef<World>(mkWorld())
	const tap = useRef(false)

	const jump = () => {
		const w = world.current
		if (w.dead) {
			Object.assign(w, mkWorld(w))
			w.on = true
			return
		}
		if (!w.on) w.on = true
		tap.current = true
	}

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext('2d')!
		const w = world.current

		const dpr = window.devicePixelRatio || 1
		canvas.width = GW * dpr
		canvas.height = GH * dpr
		canvas.style.width = '100%'
		canvas.style.height = '100%'
		ctx.scale(dpr, dpr)

		for (let i = 0; i < 8; i++)
			w.clouds.push({
				x: 60 + i * 105,
				y: 18 + Math.random() * 36,
				w: 48 + Math.random() * 42,
			})
		for (let i = 0; i < 32; i++)
			w.stars.push({
				x: Math.random() * GW,
				y: Math.random() * 80,
				r: 0.7 + Math.random() * 1.3,
				b: Math.random() * 60,
			})

		function tick() {
			ctx.clearRect(0, 0, GW, GH)
			drawSky(ctx)
			drawStars(ctx, w.stars, w.frame)

			if (tap.current) {
				tap.current = false
				applyCatJump(w)
			}

			for (const c of w.clouds) {
				c.x -= w.on ? w.spd * 0.12 : 0.2
				if (c.x + c.w < 0) c.x = GW + c.w
				drawCloud(ctx, c)
			}
			drawGround(ctx, w.frame)
			w.frame++

			if (!w.on) {
				drawCat(ctx, CAT_FLOOR, w.frame, false, true)
				drawHUD(ctx, 0, w.hi)
				drawIdleHint(ctx)
				w.raf = requestAnimationFrame(tick)
				return
			}

			if (!w.dead) {
				updateCatPhysics(w)
				updateSpeed(w)
				spawnDogs(w)
				updateDogs(w)
				checkCollisions(w)
				w.score++
			}

			for (const d of w.dogs)
				d.kind === 'runner' ? drawRunner(ctx, d) : drawJumper(ctx, d)
			drawCat(ctx, w.catY, w.frame, w.dead, false)
			drawHUD(ctx, w.score, w.hi)

			if (w.dead) drawGameOver(ctx)

			w.raf = requestAnimationFrame(tick)
		}

		w.raf = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(w.raf)
	}, [])

	return { jump }
}
