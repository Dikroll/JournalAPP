import type { Cloud, Dog, Star } from './types'
import {
	GW,
	GH,
	GROUND,
	CAT_X,
	CAT_W,
	CAT_H,
	CAT_FLOOR,
	RUNNER_TOP,
	JUMPER_FLOOR,
} from './constants'

function rr(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
) {
	r = Math.min(r, w / 2, h / 2)
	ctx.beginPath()
	ctx.moveTo(x + r, y)
	ctx.lineTo(x + w - r, y)
	ctx.arcTo(x + w, y, x + w, y + r, r)
	ctx.lineTo(x + w, y + h - r)
	ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
	ctx.lineTo(x + r, y + h)
	ctx.arcTo(x, y + h, x, y + h - r, r)
	ctx.lineTo(x, y + r)
	ctx.arcTo(x, y, x + r, y, r)
	ctx.closePath()
}

export function drawSky(ctx: CanvasRenderingContext2D) {
	const g = ctx.createLinearGradient(0, 0, 0, GROUND)
	g.addColorStop(0, '#0c0c1a')
	g.addColorStop(1, '#16162a')
	ctx.fillStyle = g
	ctx.fillRect(0, 0, GW, GROUND)
}

export function drawStars(ctx: CanvasRenderingContext2D, arr: Star[], f: number) {
	for (const s of arr) {
		const a = 0.15 + 0.85 * Math.abs(Math.sin((f + s.b) * 0.03))
		ctx.fillStyle = `rgba(210,220,255,${a.toFixed(2)})`
		ctx.beginPath()
		ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
		ctx.fill()
	}
}

export function drawCloud(ctx: CanvasRenderingContext2D, c: Cloud) {
	ctx.fillStyle = 'rgba(100,120,170,.1)'
	ctx.beginPath()
	ctx.ellipse(c.x, c.y, c.w / 2, 8, 0, 0, Math.PI * 2)
	ctx.ellipse(c.x - c.w * 0.2, c.y + 3, c.w * 0.26, 7, 0, 0, Math.PI * 2)
	ctx.ellipse(c.x + c.w * 0.2, c.y + 4, c.w * 0.2, 6, 0, 0, Math.PI * 2)
	ctx.fill()
}

export function drawGround(ctx: CanvasRenderingContext2D, f: number) {
	ctx.fillStyle = '#252534'
	ctx.fillRect(0, GROUND, GW, 2)
	ctx.fillStyle = '#111120'
	ctx.fillRect(0, GROUND + 2, GW, GH - GROUND)
	ctx.fillStyle = '#2e2e42'
	for (let i = 0; i < 26; i++) {
		const px = ((i * 44 + f * 0.6) % (GW + 14)) - 7
		ctx.fillRect(px, GROUND + 5 + (i % 3) * 4, 2 + (i % 3), 1)
	}
}

export function drawHUD(ctx: CanvasRenderingContext2D, score: number, hi: number) {
	ctx.font = 'bold 11px monospace'
	ctx.textAlign = 'right'

	ctx.fillStyle = 'rgba(100,115,160,.5)'
	ctx.fillText('HI', GW - 110, 16)
	ctx.fillStyle = 'rgba(130,150,200,.4)'
	ctx.fillText(String(hi).padStart(5, '0'), GW - 60, 16)

	const isClose = hi > 0 && score > hi * 0.8
	ctx.fillStyle = isClose ? 'rgba(255,215,80,.9)' : 'rgba(200,215,255,.85)'
	ctx.font = 'bold 14px monospace'
	ctx.fillText(String(score).padStart(5, '0'), GW - 8, 17)
}

export function drawCat(
	ctx: CanvasRenderingContext2D,
	catY: number,
	f: number,
	dead: boolean,
	idle: boolean,
) {
	const x = CAT_X
	const y = catY
	const spd = idle ? 20 : 14
	const ph = f % spd < spd / 2
	const wag = dead ? 0 : Math.sin(f * (idle ? 0.05 : 0.18)) * 10
	const airborne = !idle && catY < CAT_FLOOR - 2

	ctx.save()

	// tail
	ctx.strokeStyle = '#303030'
	ctx.lineWidth = 4
	ctx.lineCap = 'round'
	ctx.beginPath()
	ctx.moveTo(x + 3, y + 28)
	ctx.quadraticCurveTo(x - 20, y + 38 + wag, x - 14, y + 20 + wag * 0.5)
	ctx.stroke()
	ctx.fillStyle = '#404040'
	ctx.beginPath()
	ctx.arc(x - 14, y + 20 + wag * 0.5, 4.5, 0, Math.PI * 2)
	ctx.fill()

	// body
	const bodyGrad = ctx.createLinearGradient(x, y + 16, x + CAT_W, y + 42)
	bodyGrad.addColorStop(0, '#1a1a1a')
	bodyGrad.addColorStop(0.5, '#262626')
	bodyGrad.addColorStop(1, '#141414')
	ctx.fillStyle = bodyGrad
	rr(ctx, x + 1, y + 18, CAT_W - 2, 24, 9)
	ctx.fill()
	ctx.fillStyle = 'rgba(80,80,80,0.25)'
	ctx.beginPath()
	ctx.ellipse(x + 16, y + 27, 10, 7, 0, 0, Math.PI * 2)
	ctx.fill()

	// neck
	ctx.fillStyle = '#1a1a1a'
	ctx.fillRect(x + 20, y + 10, 13, 12)

	// head
	const headGrad = ctx.createLinearGradient(x + 14, y, x + 38, y + 22)
	headGrad.addColorStop(0, '#2a2a2a')
	headGrad.addColorStop(1, '#141414')
	ctx.fillStyle = headGrad
	rr(ctx, x + 14, y + 1, 24, 20, 8)
	ctx.fill()

	// ears
	ctx.fillStyle = '#202020'
	ctx.beginPath()
	ctx.moveTo(x + 16, y + 3)
	ctx.lineTo(x + 11, y - 12)
	ctx.lineTo(x + 23, y + 2)
	ctx.closePath()
	ctx.fill()
	ctx.fillStyle = '#5a1a1a'
	ctx.beginPath()
	ctx.moveTo(x + 16, y + 2)
	ctx.lineTo(x + 13, y - 8)
	ctx.lineTo(x + 21, y + 1)
	ctx.closePath()
	ctx.fill()

	ctx.fillStyle = '#202020'
	ctx.beginPath()
	ctx.moveTo(x + 30, y + 3)
	ctx.lineTo(x + 37, y - 12)
	ctx.lineTo(x + 35, y + 2)
	ctx.closePath()
	ctx.fill()
	ctx.fillStyle = '#5a1a1a'
	ctx.beginPath()
	ctx.moveTo(x + 30, y + 2)
	ctx.lineTo(x + 35, y - 8)
	ctx.lineTo(x + 33, y + 1)
	ctx.closePath()
	ctx.fill()

	if (!dead) {
		drawCatAlive(ctx, x, y, ph, airborne)
	} else {
		drawCatDead(ctx, x, y)
	}

	ctx.restore()
}

function drawCatAlive(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	ph: boolean,
	airborne: boolean,
) {
	// eyes
	ctx.fillStyle = '#dde0ec'
	ctx.beginPath()
	ctx.ellipse(x + 22, y + 9, 3.2, 3.6, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 31, y + 9, 3.2, 3.6, 0, 0, Math.PI * 2)
	ctx.fill()
	// pupils
	ctx.fillStyle = '#0a0a10'
	ctx.beginPath()
	ctx.ellipse(x + 22, y + 9, 1.2, 2.8, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 31, y + 9, 1.2, 2.8, 0, 0, Math.PI * 2)
	ctx.fill()
	// shine
	ctx.fillStyle = 'rgba(255,255,255,0.8)'
	ctx.beginPath()
	ctx.arc(x + 23, y + 7.5, 1, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.arc(x + 32, y + 7.5, 1, 0, Math.PI * 2)
	ctx.fill()

	// nose
	ctx.fillStyle = '#b84060'
	ctx.beginPath()
	ctx.moveTo(x + 26, y + 13)
	ctx.lineTo(x + 24, y + 11)
	ctx.lineTo(x + 28, y + 11)
	ctx.closePath()
	ctx.fill()

	// mouth
	ctx.strokeStyle = '#903050'
	ctx.lineWidth = 1.4
	ctx.lineCap = 'round'
	ctx.beginPath()
	ctx.moveTo(x + 26, y + 13)
	ctx.quadraticCurveTo(x + 23, y + 16, x + 21, y + 15)
	ctx.stroke()
	ctx.beginPath()
	ctx.moveTo(x + 26, y + 13)
	ctx.quadraticCurveTo(x + 29, y + 16, x + 31, y + 15)
	ctx.stroke()

	// whiskers
	ctx.strokeStyle = 'rgba(180,185,210,0.5)'
	ctx.lineWidth = 1
	ctx.beginPath()
	ctx.moveTo(x + 21, y + 12)
	ctx.lineTo(x + 7, y + 10)
	ctx.stroke()
	ctx.beginPath()
	ctx.moveTo(x + 21, y + 14)
	ctx.lineTo(x + 7, y + 16)
	ctx.stroke()
	ctx.beginPath()
	ctx.moveTo(x + 31, y + 12)
	ctx.lineTo(x + 44, y + 10)
	ctx.stroke()
	ctx.beginPath()
	ctx.moveTo(x + 31, y + 14)
	ctx.lineTo(x + 44, y + 16)
	ctx.stroke()

	// legs
	ctx.fillStyle = '#1e1e1e'
	if (airborne) {
		ctx.beginPath()
		ctx.ellipse(x + 28, y + 36, 4.5, 9, -0.4, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 18, y + 36, 4.5, 9, 0.4, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 8, y + 34, 4, 8, 0.5, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 1, y + 34, 3.5, 8, -0.5, 0, Math.PI * 2)
		ctx.fill()
	} else {
		const fA = ph ? 0.28 : -0.28,
			bA = ph ? -0.22 : 0.22
		ctx.beginPath()
		ctx.ellipse(x + 28, y + 36 + (ph ? 2 : 0), 4.5, 8, fA, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 20, y + 36 + (ph ? 0 : 2), 4.5, 8, -fA, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 8, y + 35 + (ph ? 0 : 2), 4, 7, bA, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 1, y + 35 + (ph ? 2 : 0), 3.5, 7, -bA, 0, Math.PI * 2)
		ctx.fill()
	}
	// paws
	ctx.fillStyle = '#2e2e2e'
	ctx.beginPath()
	ctx.ellipse(x + 28, y + 45, 5.5, 3, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 19, y + 45, 5.5, 3, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 8, y + 43, 5, 2.5, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 1, y + 43, 4.5, 2.5, 0, 0, Math.PI * 2)
	ctx.fill()
}

function drawCatDead(ctx: CanvasRenderingContext2D, x: number, y: number) {
	// X eyes
	ctx.strokeStyle = '#cc3333'
	ctx.lineWidth = 2.2
	ctx.lineCap = 'round'
	ctx.beginPath()
	ctx.moveTo(x + 19, y + 5)
	ctx.lineTo(x + 25, y + 13)
	ctx.stroke()
	ctx.beginPath()
	ctx.moveTo(x + 25, y + 5)
	ctx.lineTo(x + 19, y + 13)
	ctx.stroke()
	ctx.beginPath()
	ctx.moveTo(x + 28, y + 5)
	ctx.lineTo(x + 34, y + 13)
	ctx.stroke()
	ctx.beginPath()
	ctx.moveTo(x + 34, y + 5)
	ctx.lineTo(x + 28, y + 13)
	ctx.stroke()
	// collapsed legs
	ctx.fillStyle = '#1e1e1e'
	ctx.beginPath()
	ctx.ellipse(x + 24, y + 44, 7, 3.5, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 8, y + 44, 7, 3.5, 0, 0, Math.PI * 2)
	ctx.fill()
}

export function drawRunner(ctx: CanvasRenderingContext2D, d: Dog) {
	const x = d.x
	const y = RUNNER_TOP
	const ph = d.f % 12 < 6

	ctx.save()

	const tw = Math.sin(d.f * 0.3) * 12
	ctx.strokeStyle = '#92400e'
	ctx.lineWidth = 5
	ctx.lineCap = 'round'
	ctx.beginPath()
	ctx.moveTo(x + 38, y + 18)
	ctx.quadraticCurveTo(x + 54, y + 8 + tw, x + 50, y - 6 + tw * 0.5)
	ctx.stroke()
	const tg = ctx.createRadialGradient(
		x + 50, y - 6 + tw * 0.5, 1,
		x + 50, y - 6 + tw * 0.5, 5,
	)
	tg.addColorStop(0, '#fde68a')
	tg.addColorStop(1, '#d97706')
	ctx.fillStyle = tg
	ctx.beginPath()
	ctx.arc(x + 50, y - 6 + tw * 0.5, 5, 0, Math.PI * 2)
	ctx.fill()

	const bodyGrad = ctx.createLinearGradient(x + 4, y + 14, x + 38, y + 36)
	bodyGrad.addColorStop(0, '#b45309')
	bodyGrad.addColorStop(0.5, '#d97706')
	bodyGrad.addColorStop(1, '#92400e')
	ctx.fillStyle = bodyGrad
	rr(ctx, x + 4, y + 14, 34, 22, 9)
	ctx.fill()
	const bellyGrad = ctx.createRadialGradient(x + 18, y + 25, 2, x + 18, y + 25, 13)
	bellyGrad.addColorStop(0, 'rgba(253,230,138,0.5)')
	bellyGrad.addColorStop(1, 'rgba(253,230,138,0)')
	ctx.fillStyle = bellyGrad
	ctx.beginPath()
	ctx.ellipse(x + 18, y + 25, 13, 8, 0, 0, Math.PI * 2)
	ctx.fill()

	ctx.fillStyle = '#b45309'
	ctx.fillRect(x + 4, y + 6, 13, 13)

	const headGrad = ctx.createLinearGradient(x - 8, y, x + 14, y + 20)
	headGrad.addColorStop(0, '#d97706')
	headGrad.addColorStop(1, '#92400e')
	ctx.fillStyle = headGrad
	rr(ctx, x - 8, y, 22, 20, 7)
	ctx.fill()

	ctx.fillStyle = '#fde68a'
	rr(ctx, x - 16, y + 8, 14, 11, 4)
	ctx.fill()
	ctx.fillStyle = '#1a0808'
	ctx.beginPath()
	ctx.ellipse(x - 14, y + 11, 3.5, 2.5, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = 'rgba(255,255,255,0.4)'
	ctx.beginPath()
	ctx.arc(x - 15, y + 10, 1.2, 0, Math.PI * 2)
	ctx.fill()

	ctx.fillStyle = '#92400e'
	ctx.beginPath()
	ctx.moveTo(x - 4, y + 2)
	ctx.quadraticCurveTo(x - 16, y + 8, x - 12, y + 22)
	ctx.quadraticCurveTo(x - 6, y + 24, x + 2, y + 18)
	ctx.quadraticCurveTo(x + 2, y + 6, x - 4, y + 2)
	ctx.fill()
	ctx.fillStyle = 'rgba(251,191,36,0.3)'
	ctx.beginPath()
	ctx.moveTo(x - 4, y + 4)
	ctx.quadraticCurveTo(x - 12, y + 9, x - 9, y + 19)
	ctx.quadraticCurveTo(x - 5, y + 20, x + 1, y + 15)
	ctx.quadraticCurveTo(x, y + 7, x - 4, y + 4)
	ctx.fill()

	ctx.fillStyle = '#1a0808'
	ctx.beginPath()
	ctx.arc(x - 2, y + 8, 4, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = '#7c3500'
	ctx.beginPath()
	ctx.arc(x - 2, y + 8, 2.8, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = '#1a0808'
	ctx.beginPath()
	ctx.arc(x - 2, y + 8, 1.8, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = 'rgba(255,255,255,0.8)'
	ctx.beginPath()
	ctx.arc(x - 3, y + 7, 1.2, 0, Math.PI * 2)
	ctx.fill()

	ctx.strokeStyle = '#dc2626'
	ctx.lineWidth = 3
	ctx.lineCap = 'round'
	ctx.beginPath()
	ctx.moveTo(x - 2, y + 3)
	ctx.lineTo(x + 8, y + 5)
	ctx.stroke()
	ctx.fillStyle = '#fbbf24'
	ctx.beginPath()
	ctx.arc(x + 3, y + 6, 2.5, 0, Math.PI * 2)
	ctx.fill()

	ctx.strokeStyle = '#7c3500'
	ctx.lineWidth = 1.5
	ctx.lineCap = 'round'
	ctx.beginPath()
	ctx.moveTo(x - 6, y + 16)
	ctx.quadraticCurveTo(x - 10, y + 21, x - 6, y + 22)
	ctx.quadraticCurveTo(x - 2, y + 23, x, y + 18)
	ctx.stroke()
	ctx.fillStyle = '#f87171'
	ctx.beginPath()
	ctx.moveTo(x - 10, y + 22)
	ctx.quadraticCurveTo(x - 11, y + 30, x - 7, y + 31)
	ctx.quadraticCurveTo(x - 3, y + 32, x - 2, y + 27)
	ctx.quadraticCurveTo(x - 6, y + 25, x - 10, y + 22)
	ctx.fill()

	ctx.fillStyle = '#b45309'
	ctx.beginPath()
	ctx.ellipse(x + 6, y + 32 + (ph ? 2 : 0), 4.5, 8, ph ? -0.3 : 0.3, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 14, y + 32 + (ph ? 0 : 2), 4.5, 8, ph ? 0.3 : -0.3, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 24, y + 31 + (ph ? 0 : 2), 4, 7, ph ? 0.2 : -0.2, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 32, y + 31 + (ph ? 2 : 0), 4, 7, ph ? -0.2 : 0.2, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = '#d97706'
	ctx.beginPath()
	ctx.ellipse(x + 6, y + 41, 5.5, 3, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 14, y + 41, 5.5, 3, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 24, y + 39, 5, 2.8, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 32, y + 39, 5, 2.8, 0, 0, Math.PI * 2)
	ctx.fill()

	ctx.restore()
}

export function drawJumper(ctx: CanvasRenderingContext2D, d: Dog) {
	const x = d.x
	const y = d.y
	const airborne = d.jumped && d.y < JUMPER_FLOOR - 2
	const tilt = airborne ? Math.atan2(d.vy, -d.spd) * 0.45 : 0

	ctx.save()
	ctx.translate(x + 18, y + 14)
	ctx.rotate(tilt)
	ctx.translate(-(x + 18), -(y + 14))

	// tail
	const tw = Math.sin(d.f * 0.28) * 10
	ctx.strokeStyle = '#6b7280'
	ctx.lineWidth = 4
	ctx.lineCap = 'round'
	ctx.beginPath()
	ctx.moveTo(x + 32, y + 12)
	ctx.quadraticCurveTo(x + 46, y + 2 + tw, x + 42, y - 8 + tw * 0.5)
	ctx.stroke()
	const ttg = ctx.createRadialGradient(
		x + 42, y - 8 + tw * 0.5, 1,
		x + 42, y - 8 + tw * 0.5, 5,
	)
	ttg.addColorStop(0, '#e5e7eb')
	ttg.addColorStop(1, '#9ca3af')
	ctx.fillStyle = ttg
	ctx.beginPath()
	ctx.arc(x + 42, y - 8 + tw * 0.5, 5, 0, Math.PI * 2)
	ctx.fill()

	const bodyGrad = ctx.createLinearGradient(x + 2, y + 8, x + 30, y + 24)
	bodyGrad.addColorStop(0, '#d1d5db')
	bodyGrad.addColorStop(0.5, '#e5e7eb')
	bodyGrad.addColorStop(1, '#9ca3af')
	ctx.fillStyle = bodyGrad
	rr(ctx, x + 2, y + 8, 28, 16, 7)
	ctx.fill()
	const bGrad = ctx.createRadialGradient(x + 14, y + 15, 2, x + 14, y + 15, 10)
	bGrad.addColorStop(0, 'rgba(255,255,255,0.45)')
	bGrad.addColorStop(1, 'rgba(255,255,255,0)')
	ctx.fillStyle = bGrad
	ctx.beginPath()
	ctx.ellipse(x + 14, y + 15, 10, 6, 0, 0, Math.PI * 2)
	ctx.fill()

	ctx.fillStyle = '#d1d5db'
	ctx.fillRect(x, y + 2, 10, 10)
	const headGrad = ctx.createLinearGradient(x - 14, y - 2, x + 4, y + 14)
	headGrad.addColorStop(0, '#e5e7eb')
	headGrad.addColorStop(1, '#9ca3af')
	ctx.fillStyle = headGrad
	rr(ctx, x - 14, y - 2, 18, 17, 6)
	ctx.fill()

	ctx.fillStyle = '#f3f4f6'
	rr(ctx, x - 21, y + 5, 11, 9, 3)
	ctx.fill()
	ctx.fillStyle = '#374151'
	ctx.beginPath()
	ctx.ellipse(x - 20, y + 8, 3.2, 2.2, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = 'rgba(255,255,255,0.5)'
	ctx.beginPath()
	ctx.arc(x - 21, y + 7, 1.1, 0, Math.PI * 2)
	ctx.fill()

	if (airborne) {
		ctx.fillStyle = '#9ca3af'
		ctx.beginPath()
		ctx.moveTo(x - 10, y + 0)
		ctx.lineTo(x - 16, y - 14)
		ctx.lineTo(x - 2, y - 1)
		ctx.closePath()
		ctx.fill()
		ctx.beginPath()
		ctx.moveTo(x + 2, y - 1)
		ctx.lineTo(x + 6, y - 14)
		ctx.lineTo(x + 10, y + 0)
		ctx.closePath()
		ctx.fill()
		ctx.fillStyle = '#fca5a5'
		ctx.beginPath()
		ctx.moveTo(x - 10, y + 0)
		ctx.lineTo(x - 14, y - 9)
		ctx.lineTo(x - 3, y - 1)
		ctx.closePath()
		ctx.fill()
		ctx.beginPath()
		ctx.moveTo(x + 2, y - 1)
		ctx.lineTo(x + 5, y - 9)
		ctx.lineTo(x + 9, y + 0)
		ctx.closePath()
		ctx.fill()
	} else {
		ctx.fillStyle = '#9ca3af'
		ctx.beginPath()
		ctx.moveTo(x - 6, y + 0)
		ctx.quadraticCurveTo(x - 15, y + 7, x - 11, y + 17)
		ctx.quadraticCurveTo(x - 6, y + 19, x - 1, y + 13)
		ctx.quadraticCurveTo(x - 2, y + 5, x - 6, y + 0)
		ctx.fill()
		ctx.fillStyle = 'rgba(252,165,165,0.5)'
		ctx.beginPath()
		ctx.moveTo(x - 6, y + 2)
		ctx.quadraticCurveTo(x - 12, y + 8, x - 9, y + 14)
		ctx.quadraticCurveTo(x - 6, y + 15, x - 2, y + 11)
		ctx.quadraticCurveTo(x - 2, y + 6, x - 6, y + 2)
		ctx.fill()
	}

	ctx.strokeStyle = '#7c3aed'
	ctx.lineWidth = 3
	ctx.lineCap = 'round'
	ctx.beginPath()
	ctx.moveTo(x - 2, y + 2)
	ctx.lineTo(x + 8, y + 4)
	ctx.stroke()
	ctx.fillStyle = '#a78bfa'
	ctx.beginPath()
	ctx.arc(x + 3, y + 5, 2.2, 0, Math.PI * 2)
	ctx.fill()

	ctx.fillStyle = '#111827'
	ctx.beginPath()
	ctx.arc(x - 8, y + 6, 4, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = '#1d4ed8'
	ctx.beginPath()
	ctx.arc(x - 8, y + 6, 2.8, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = '#111827'
	ctx.beginPath()
	ctx.arc(x - 8, y + 6, 1.6, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = 'rgba(255,255,255,0.9)'
	ctx.beginPath()
	ctx.arc(x - 9, y + 5, 1.2, 0, Math.PI * 2)
	ctx.fill()
	if (airborne) {
		ctx.strokeStyle = 'rgba(167,139,250,0.7)'
		ctx.lineWidth = 1
		ctx.beginPath()
		ctx.arc(x - 8, y + 6, 5.5, 0, Math.PI * 2)
		ctx.stroke()
	}
	if (airborne) {
		ctx.fillStyle = '#111827'
		ctx.beginPath()
		ctx.arc(x - 15, y + 13, 4, 0, Math.PI)
		ctx.fill()
		ctx.fillStyle = '#ef4444'
		ctx.beginPath()
		ctx.ellipse(x - 15, y + 15, 2.5, 3.5, 0, 0, Math.PI * 2)
		ctx.fill()
	} else {
		ctx.strokeStyle = '#6b7280'
		ctx.lineWidth = 1.5
		ctx.lineCap = 'round'
		ctx.beginPath()
		ctx.moveTo(x - 19, y + 11)
		ctx.quadraticCurveTo(x - 15, y + 14, x - 11, y + 11)
		ctx.stroke()
	}

	ctx.fillStyle = '#c4c4c4'
	if (airborne) {
		ctx.beginPath()
		ctx.ellipse(x + 2, y + 22, 3.5, 8, -0.5, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x - 5, y + 20, 3.5, 8, -0.7, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 20, y + 20, 3.5, 8, 0.5, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 26, y + 18, 3.5, 8, 0.7, 0, Math.PI * 2)
		ctx.fill()
	} else {
		const ph = d.f % 12 < 6
		ctx.beginPath()
		ctx.ellipse(x + 2, y + 20 + (ph ? 2 : 0), 3.5, 7, ph ? -0.25 : 0.25, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 8, y + 20 + (ph ? 0 : 2), 3.5, 7, ph ? 0.25 : -0.25, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 18, y + 19 + (ph ? 0 : 2), 3, 6, ph ? 0.2 : -0.2, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 24, y + 19 + (ph ? 2 : 0), 3, 6, ph ? -0.2 : 0.2, 0, Math.PI * 2)
		ctx.fill()
	}

	ctx.fillStyle = '#e5e7eb'
	ctx.beginPath()
	ctx.ellipse(x + 2, y + 28, 4.5, 2.5, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 8, y + 27, 4.5, 2.5, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 18, y + 25, 4, 2.2, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 24, y + 25, 4, 2.2, 0, 0, Math.PI * 2)
	ctx.fill()

	ctx.restore()
}

export function drawGameOver(ctx: CanvasRenderingContext2D) {
	ctx.fillStyle = 'rgba(205,212,228,.92)'
	ctx.font = 'bold 15px monospace'
	ctx.textAlign = 'center'
	ctx.fillText('GAME OVER', GW / 2, GH / 2 - 6)
	ctx.fillStyle = 'rgba(167,139,250,.6)'
	ctx.font = '11px monospace'
	ctx.fillText('тапни — играть снова', GW / 2, GH / 2 + 12)
}

export function drawIdleHint(ctx: CanvasRenderingContext2D) {
	ctx.fillStyle = 'rgba(167,139,250,.5)'
	ctx.font = '12px monospace'
	ctx.textAlign = 'center'
	ctx.fillText('тапни чтобы начать', GW / 2, GH - 8)
}
