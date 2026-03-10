import { useEffect, useRef } from 'react'

// ── World constants ────────────────────────────────────────────────────────
export const GW = 600
export const GH = 220
const GROUND = 170

const CAT_X = 72
const CAT_W = 36
const CAT_H = 44
const CAT_FLOOR = GROUND - CAT_H // 126 — cat top at rest

// Cat physics — rise = 80px above rest, g=1.0
// v0 = -sqrt(2·g·rise), air-time = 2·|v0|/g ≈ 25 frames
const G = 1.0
const JUMP_V = -Math.sqrt(2 * G * 85) // ≈ -12.65

// Runner dog sits at GROUND-46 (top y = 124)
const RUNNER_TOP = GROUND - 46 // 124

// Jumper dog is shorter (h≈28) so its top at ground = GROUND-28 = 142
// It runs normally and jumps when it reaches TRIGGER_X from the cat.
// Peak y = 80 on canvas (well above cat top=126), rise = 142-80 = 62
// v0_jump = -sqrt(2·DOG_G·62) ≈ -10.85, tPeak ≈ 11.4 frames
// At dogSpd≈7, trigger = CAT_X + 10 + 7*11.4 ≈ 162
// Dog appears at GW+10, runs ~440px before trigger — clearly visible approach
const DOG_G = G * 0.95
const JUMP_PEAK_Y = 80
const JUMPER_FLOOR = GROUND - 28 // 142
const JUMPER_RISE = JUMPER_FLOOR - JUMP_PEAK_Y // 62
const JUMPER_V0 = -Math.sqrt(2 * DOG_G * JUMPER_RISE) // -10.85
const JUMPER_T_PEAK = -JUMPER_V0 / DOG_G // 11.4 frames

type Kind = 'runner' | 'jumper'
interface Dog {
	x: number
	y: number
	vy: number
	f: number
	spd: number
	kind: Kind
	jumped: boolean
}
interface Cloud {
	x: number
	y: number
	w: number
}
interface Star {
	x: number
	y: number
	r: number
	b: number
}

interface World {
	on: boolean
	dead: boolean
	catY: number
	catVY: number
	grounded: boolean
	dogs: Dog[]
	clouds: Cloud[]
	stars: Star[]
	score: number
	spd: number
	frame: number
	nextDog: number
	raf: number
	hi: number
}

function mkWorld(p?: Partial<World>): World {
	return {
		on: false,
		dead: false,
		catY: CAT_FLOOR,
		catVY: 0,
		grounded: true,
		dogs: [],
		clouds: p?.clouds ?? [],
		stars: p?.stars ?? [],
		score: 0,
		spd: 5.2,
		frame: 0,
		nextDog: 110,
		raf: p?.raf ?? 0,
		hi: p?.hi ?? 0,
	}
}

// ── Helpers ────────────────────────────────────────────────────────────────
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

// ── Scene ──────────────────────────────────────────────────────────────────
function drawSky(ctx: CanvasRenderingContext2D) {
	const g = ctx.createLinearGradient(0, 0, 0, GROUND)
	g.addColorStop(0, '#0c0c16')
	g.addColorStop(1, '#181824')
	ctx.fillStyle = g
	ctx.fillRect(0, 0, GW, GROUND)
}

function drawStars(ctx: CanvasRenderingContext2D, arr: Star[], f: number) {
	for (const s of arr) {
		const a = 0.15 + 0.85 * Math.abs(Math.sin((f + s.b) * 0.03))
		ctx.fillStyle = `rgba(210,220,255,${a.toFixed(2)})`
		ctx.beginPath()
		ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
		ctx.fill()
	}
}

function drawCloud(ctx: CanvasRenderingContext2D, c: Cloud) {
	ctx.fillStyle = 'rgba(100,120,170,.1)'
	ctx.beginPath()
	ctx.ellipse(c.x, c.y, c.w / 2, 8, 0, 0, Math.PI * 2)
	ctx.ellipse(c.x - c.w * 0.2, c.y + 3, c.w * 0.26, 7, 0, 0, Math.PI * 2)
	ctx.ellipse(c.x + c.w * 0.2, c.y + 4, c.w * 0.2, 6, 0, 0, Math.PI * 2)
	ctx.fill()
}

function drawGround(ctx: CanvasRenderingContext2D, f: number) {
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

function drawHUD(ctx: CanvasRenderingContext2D, score: number, hi: number) {
	ctx.font = 'bold 11px monospace'
	ctx.textAlign = 'right'
	ctx.fillStyle = 'rgba(100,115,160,.5)'
	ctx.fillText('HI', GW - 110, 16)
	ctx.fillStyle = 'rgba(130,150,200,.4)'
	ctx.fillText(String(hi).padStart(5, '0'), GW - 100, 16)
	ctx.fillStyle =
		hi > 0 && score > hi * 0.8 ? 'rgba(255,215,80,.9)' : 'rgba(200,215,255,.85)'
	ctx.font = 'bold 14px monospace'
	ctx.fillText(String(score).padStart(5, '0'), GW - 8, 17)
}

// ── Cat ────────────────────────────────────────────────────────────────────
function drawCat(
	ctx: CanvasRenderingContext2D,
	catY: number,
	f: number,
	dead: boolean,
	idle: boolean,
) {
	const x = CAT_X,
		y = catY
	const spd = idle ? 20 : 14,
		ph = f % spd < spd / 2
	const wag = dead ? 0 : Math.sin(f * (idle ? 0.05 : 0.18)) * 10
	ctx.save()

	// tail
	ctx.strokeStyle = '#303030'
	ctx.lineWidth = 4
	ctx.lineCap = 'round'
	ctx.beginPath()
	ctx.moveTo(x + 2, y + 26)
	ctx.quadraticCurveTo(x - 18, y + 36 + wag, x - 12, y + 18 + wag * 0.5)
	ctx.stroke()
	ctx.fillStyle = '#404040'
	ctx.beginPath()
	ctx.arc(x - 12, y + 18 + wag * 0.5, 4.5, 0, Math.PI * 2)
	ctx.fill()

	// body
	ctx.fillStyle = '#242424'
	rr(ctx, x, y + 16, CAT_W, 22, 8)
	ctx.fill()
	ctx.fillStyle = '#2c2c2c'
	ctx.beginPath()
	ctx.ellipse(x + 14, y + 24, 9, 7, 0, 0, Math.PI * 2)
	ctx.fill()

	// neck
	ctx.fillStyle = '#242424'
	ctx.fillRect(x + 18, y + 8, 14, 12)

	// head
	rr(ctx, x + 14, y, 22, 20, 7)
	ctx.fill()

	// ears
	ctx.fillStyle = '#242424'
	ctx.beginPath()
	ctx.moveTo(x + 16, y + 2)
	ctx.lineTo(x + 12, y - 10)
	ctx.lineTo(x + 22, y + 1)
	ctx.closePath()
	ctx.fill()
	ctx.beginPath()
	ctx.moveTo(x + 30, y + 2)
	ctx.lineTo(x + 36, y - 10)
	ctx.lineTo(x + 34, y + 1)
	ctx.closePath()
	ctx.fill()
	ctx.fillStyle = '#4a1e1e'
	ctx.beginPath()
	ctx.moveTo(x + 17, y + 1)
	ctx.lineTo(x + 14, y - 7)
	ctx.lineTo(x + 21, y + 1)
	ctx.closePath()
	ctx.fill()
	ctx.beginPath()
	ctx.moveTo(x + 30, y + 1)
	ctx.lineTo(x + 35, y - 7)
	ctx.lineTo(x + 33, y + 1)
	ctx.closePath()
	ctx.fill()

	if (!dead) {
		// eyes
		ctx.fillStyle = '#dde0ec'
		ctx.beginPath()
		ctx.ellipse(x + 22, y + 8, 4, 4.5, 0, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 31, y + 8, 4, 4.5, 0, 0, Math.PI * 2)
		ctx.fill()
		ctx.fillStyle = '#0a0a10'
		ctx.beginPath()
		ctx.ellipse(x + 22, y + 8, 1.5, 3.5, 0, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 31, y + 8, 1.5, 3.5, 0, 0, Math.PI * 2)
		ctx.fill()
		ctx.fillStyle = 'rgba(255,255,255,.8)'
		ctx.beginPath()
		ctx.arc(x + 23, y + 6, 1.1, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.arc(x + 32, y + 6, 1.1, 0, Math.PI * 2)
		ctx.fill()
		// nose+mouth
		ctx.fillStyle = '#b84060'
		ctx.beginPath()
		ctx.moveTo(x + 26, y + 13)
		ctx.lineTo(x + 24, y + 11)
		ctx.lineTo(x + 28, y + 11)
		ctx.closePath()
		ctx.fill()
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
		ctx.strokeStyle = 'rgba(180,185,210,.5)'
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
		const fA = ph ? 0.25 : -0.25,
			bA = ph ? -0.2 : 0.2
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
		ctx.fillStyle = '#2e2e2e'
		ctx.beginPath()
		ctx.ellipse(x + 28, y + 44, 5.5, 3, 0, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 19, y + 44, 5.5, 3, 0, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 8, y + 42, 5, 3, 0, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 1, y + 42, 4.5, 3, 0, 0, Math.PI * 2)
		ctx.fill()
	} else {
		ctx.strokeStyle = '#cc3333'
		ctx.lineWidth = 2.2
		ctx.lineCap = 'round'
		ctx.beginPath()
		ctx.moveTo(x + 19, y + 4)
		ctx.lineTo(x + 25, y + 12)
		ctx.stroke()
		ctx.beginPath()
		ctx.moveTo(x + 25, y + 4)
		ctx.lineTo(x + 19, y + 12)
		ctx.stroke()
		ctx.beginPath()
		ctx.moveTo(x + 28, y + 4)
		ctx.lineTo(x + 34, y + 12)
		ctx.stroke()
		ctx.beginPath()
		ctx.moveTo(x + 34, y + 4)
		ctx.lineTo(x + 28, y + 12)
		ctx.stroke()
		ctx.fillStyle = '#1e1e1e'
		ctx.beginPath()
		ctx.ellipse(x + 24, y + 42, 7, 3.5, 0, 0, Math.PI * 2)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(x + 8, y + 42, 7, 3.5, 0, 0, Math.PI * 2)
		ctx.fill()
	}
	ctx.restore()
}

// ── Runner dog ─────────────────────────────────────────────────────────────
function drawRunner(ctx: CanvasRenderingContext2D, d: Dog) {
	const x = d.x,
		y = RUNNER_TOP,
		ph = d.f % 12 < 6
	ctx.save()
	const tw = Math.sin(d.f * 0.3) * 12
	ctx.strokeStyle = '#7a5010'
	ctx.lineWidth = 4
	ctx.lineCap = 'round'
	ctx.beginPath()
	ctx.moveTo(x + 38, y + 18)
	ctx.quadraticCurveTo(x + 52, y + 8 + tw, x + 48, y - 6 + tw * 0.5)
	ctx.stroke()
	ctx.fillStyle = '#9a6818'
	ctx.beginPath()
	ctx.arc(x + 48, y - 6 + tw * 0.5, 4, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = '#b07a18'
	rr(ctx, x + 4, y + 14, 34, 20, 8)
	ctx.fill()
	ctx.fillStyle = '#cca040'
	ctx.beginPath()
	ctx.ellipse(x + 18, y + 22, 12, 7, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = '#b07a18'
	ctx.fillRect(x + 4, y + 6, 12, 12)
	rr(ctx, x - 8, y, 22, 18, 7)
	ctx.fill()
	ctx.fillStyle = '#cca040'
	rr(ctx, x - 14, y + 7, 14, 10, 4)
	ctx.fill()
	ctx.fillStyle = '#1a0808'
	ctx.beginPath()
	ctx.ellipse(x - 15, y + 10, 3.5, 2.5, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = 'rgba(255,255,255,.35)'
	ctx.beginPath()
	ctx.arc(x - 16, y + 9, 1, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = '#7a5010'
	ctx.beginPath()
	ctx.moveTo(x - 4, y + 2)
	ctx.quadraticCurveTo(x - 14, y + 8, x - 10, y + 20)
	ctx.quadraticCurveTo(x - 4, y + 22, x + 2, y + 16)
	ctx.quadraticCurveTo(x + 2, y + 6, x - 4, y + 2)
	ctx.fill()
	ctx.fillStyle = '#120808'
	ctx.beginPath()
	ctx.arc(x - 2, y + 8, 3.5, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = 'rgba(255,255,255,.65)'
	ctx.beginPath()
	ctx.arc(x - 3, y + 7, 1.2, 0, Math.PI * 2)
	ctx.fill()
	ctx.strokeStyle = '#4a2808'
	ctx.lineWidth = 2
	ctx.lineCap = 'round'
	ctx.beginPath()
	ctx.moveTo(x - 6, y + 3)
	ctx.lineTo(x + 2, y + 5)
	ctx.stroke()
	ctx.fillStyle = '#120808'
	ctx.beginPath()
	ctx.moveTo(x - 6, y + 16)
	ctx.quadraticCurveTo(x - 12, y + 22, x - 8, y + 24)
	ctx.quadraticCurveTo(x - 4, y + 26, x, y + 22)
	ctx.lineTo(x - 2, y + 16)
	ctx.closePath()
	ctx.fill()
	ctx.fillStyle = '#d04060'
	ctx.beginPath()
	ctx.moveTo(x - 10, y + 21)
	ctx.quadraticCurveTo(x - 11, y + 29, x - 7, y + 30)
	ctx.quadraticCurveTo(x - 3, y + 31, x - 2, y + 26)
	ctx.quadraticCurveTo(x - 6, y + 24, x - 10, y + 21)
	ctx.fill()
	ctx.fillStyle = '#9a6818'
	ctx.beginPath()
	ctx.ellipse(
		x + 6,
		y + 32 + (ph ? 2 : 0),
		4.5,
		8,
		ph ? -0.3 : 0.3,
		0,
		Math.PI * 2,
	)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(
		x + 14,
		y + 32 + (ph ? 0 : 2),
		4.5,
		8,
		ph ? 0.3 : -0.3,
		0,
		Math.PI * 2,
	)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(
		x + 24,
		y + 31 + (ph ? 0 : 2),
		4,
		7,
		ph ? 0.2 : -0.2,
		0,
		Math.PI * 2,
	)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(
		x + 32,
		y + 31 + (ph ? 2 : 0),
		4,
		7,
		ph ? -0.2 : 0.2,
		0,
		Math.PI * 2,
	)
	ctx.fill()
	ctx.fillStyle = '#cca040'
	ctx.beginPath()
	ctx.ellipse(x + 6, y + 40, 5.5, 3, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 14, y + 40, 5.5, 3, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 24, y + 38, 5, 3, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.beginPath()
	ctx.ellipse(x + 32, y + 38, 5, 3, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.restore()
}

// ── Jumper dog ─────────────────────────────────────────────────────────────
function drawJumper(ctx: CanvasRenderingContext2D, d: Dog) {
	const x = d.x,
		y = d.y
	const airborne = d.jumped && d.y < JUMPER_FLOOR - 2
	const tilt = airborne ? Math.atan2(d.vy, -d.spd) * 0.45 : 0

	ctx.save()
	ctx.translate(x + 18, y + 14)
	ctx.rotate(tilt)
	ctx.translate(-(x + 18), -(y + 14))

	// tail
	const tw = Math.sin(d.f * 0.28) * 10
	ctx.strokeStyle = '#909090'
	ctx.lineWidth = 4
	ctx.lineCap = 'round'
	ctx.beginPath()
	ctx.moveTo(x + 32, y + 12)
	ctx.quadraticCurveTo(x + 44, y + 2 + tw, x + 40, y - 8 + tw * 0.5)
	ctx.stroke()
	ctx.fillStyle = '#b0b0b0'
	ctx.beginPath()
	ctx.arc(x + 40, y - 8 + tw * 0.5, 4, 0, Math.PI * 2)
	ctx.fill()

	// body
	ctx.fillStyle = '#d0d0d0'
	rr(ctx, x + 2, y + 8, 28, 14, 7)
	ctx.fill()
	ctx.fillStyle = '#ececec'
	ctx.beginPath()
	ctx.ellipse(x + 14, y + 14, 9, 5, 0, 0, Math.PI * 2)
	ctx.fill()

	// neck+head
	ctx.fillStyle = '#d0d0d0'
	ctx.fillRect(x, y + 2, 10, 10)
	rr(ctx, x - 14, y - 2, 18, 16, 6)
	ctx.fill()

	// snout
	ctx.fillStyle = '#ececec'
	rr(ctx, x - 20, y + 6, 10, 8, 3)
	ctx.fill()
	ctx.fillStyle = '#1a1a1a'
	ctx.beginPath()
	ctx.ellipse(x - 21, y + 8, 3, 2, 0, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = 'rgba(255,255,255,.4)'
	ctx.beginPath()
	ctx.arc(x - 22, y + 7, 1, 0, Math.PI * 2)
	ctx.fill()

	// ears — perked up when airborne, flat when running
	if (airborne) {
		ctx.fillStyle = '#b0b0b0'
		ctx.beginPath()
		ctx.moveTo(x - 10, y + 0)
		ctx.lineTo(x - 15, y - 12)
		ctx.lineTo(x - 2, y - 1)
		ctx.closePath()
		ctx.fill()
		ctx.beginPath()
		ctx.moveTo(x + 2, y - 1)
		ctx.lineTo(x + 5, y - 12)
		ctx.lineTo(x + 10, y + 0)
		ctx.closePath()
		ctx.fill()
		ctx.fillStyle = '#d8a0a0'
		ctx.beginPath()
		ctx.moveTo(x - 10, y + 0)
		ctx.lineTo(x - 13, y - 8)
		ctx.lineTo(x - 3, y - 1)
		ctx.closePath()
		ctx.fill()
		ctx.beginPath()
		ctx.moveTo(x + 2, y - 1)
		ctx.lineTo(x + 5, y - 8)
		ctx.lineTo(x + 9, y + 0)
		ctx.closePath()
		ctx.fill()
	} else {
		// floppy ears while running
		ctx.fillStyle = '#aaaaaa'
		ctx.beginPath()
		ctx.moveTo(x - 6, y + 0)
		ctx.quadraticCurveTo(x - 14, y + 6, x - 10, y + 16)
		ctx.quadraticCurveTo(x - 5, y + 18, x - 1, y + 12)
		ctx.quadraticCurveTo(x - 2, y + 4, x - 6, y + 0)
		ctx.fill()
	}

	// eye
	ctx.fillStyle = '#141414'
	ctx.beginPath()
	ctx.arc(x - 8, y + 6, 4, 0, Math.PI * 2)
	ctx.fill()
	ctx.fillStyle = '#ffffff'
	ctx.beginPath()
	ctx.arc(x - 9, y + 5, 1.6, 0, Math.PI * 2)
	ctx.fill()
	// excited ring when airborne
	if (airborne) {
		ctx.strokeStyle = '#aaa'
		ctx.lineWidth = 0.8
		ctx.beginPath()
		ctx.arc(x - 8, y + 6, 5.5, 0, Math.PI * 2)
		ctx.stroke()
	}

	// mouth
	ctx.fillStyle = '#141414'
	if (airborne) {
		ctx.beginPath()
		ctx.arc(x - 14, y + 13, 4, 0, Math.PI)
		ctx.fill()
		ctx.fillStyle = '#d04060'
		ctx.beginPath()
		ctx.ellipse(x - 14, y + 15, 2.5, 3.5, 0, 0, Math.PI * 2)
		ctx.fill()
	} else {
		// closed mouth running
		ctx.strokeStyle = '#888'
		ctx.lineWidth = 1.5
		ctx.lineCap = 'round'
		ctx.beginPath()
		ctx.moveTo(x - 18, y + 11)
		ctx.quadraticCurveTo(x - 14, y + 14, x - 10, y + 11)
		ctx.stroke()
	}

	// legs
	ctx.fillStyle = '#b8b8b8'
	if (airborne) {
		// splayed in leap
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
		ctx.ellipse(
			x + 2,
			y + 20 + (ph ? 2 : 0),
			3.5,
			7,
			ph ? -0.25 : 0.25,
			0,
			Math.PI * 2,
		)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(
			x + 8,
			y + 20 + (ph ? 0 : 2),
			3.5,
			7,
			ph ? 0.25 : -0.25,
			0,
			Math.PI * 2,
		)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(
			x + 18,
			y + 19 + (ph ? 0 : 2),
			3,
			6,
			ph ? 0.2 : -0.2,
			0,
			Math.PI * 2,
		)
		ctx.fill()
		ctx.beginPath()
		ctx.ellipse(
			x + 24,
			y + 19 + (ph ? 2 : 0),
			3,
			6,
			ph ? -0.2 : 0.2,
			0,
			Math.PI * 2,
		)
		ctx.fill()
	}
	ctx.restore()
}

// ── Hook ──────────────────────────────────────────────────────────────────
export function useCatGame(canvasRef: React.RefObject<HTMLCanvasElement>) {
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

			// consume tap immediately
			if (tap.current) {
				tap.current = false
				if (w.grounded) {
					w.catVY = JUMP_V
					w.grounded = false
				}
			}

			for (const c of w.clouds) {
				c.x -= w.on ? w.spd * 0.12 : 0.2
				if (c.x + c.w < 0) c.x = GW + c.w
				drawCloud(ctx, c)
			}
			drawGround(ctx, w.frame)
			w.frame++

			// idle screen
			if (!w.on) {
				drawCat(ctx, CAT_FLOOR, w.frame, false, true)
				drawHUD(ctx, 0, w.hi)
				ctx.fillStyle = 'rgba(130,150,200,.38)'
				ctx.font = '12px monospace'
				ctx.textAlign = 'center'
				ctx.fillText('тапни чтобы начать', GW / 2, GH - 8)
				w.raf = requestAnimationFrame(tick)
				return
			}

			if (!w.dead) {
				// ── cat physics ──
				w.catVY += G
				w.catY += w.catVY
				if (w.catY >= CAT_FLOOR) {
					w.catY = CAT_FLOOR
					w.catVY = 0
					w.grounded = true
				}
				if (w.catY < 2) {
					w.catY = 2
					w.catVY = 0
				}

				// speed ramp
				w.spd = 5.2 + Math.floor(w.score / 350) * 0.35

				// ── spawn ──
				w.nextDog--
				if (w.nextDog <= 0) {
					const isJumper = Math.random() < 0.32
					if (isJumper) {
						// Dog runs in from right at normal speed.
						// When it reaches triggerX it jumps automatically.
						// triggerX = CAT_X + 10 + spd * JUMPER_T_PEAK
						// so peak of arc coincides with cat position.
						const dogSpd = w.spd + 2.5
						const triggerX = CAT_X + 10 + dogSpd * JUMPER_T_PEAK
						w.dogs.push({
							x: GW + 10,
							y: JUMPER_FLOOR,
							vy: 0,
							f: 0,
							spd: dogSpd,
							kind: 'jumper',
							jumped: false,
						})
						// Store triggerX in spd field... instead use a separate approach:
						// We'll detect trigger inside the update loop by checking x <= triggerX
						// Tag it as a jumper with jumped=false, and jump when x crosses triggerX
						// We need to store triggerX. Use a trick: encode in the y field temporarily? No.
						// Better: just compute triggerX fresh each frame from spd.
					} else {
						w.dogs.push({
							x: GW + 10,
							y: RUNNER_TOP,
							vy: 0,
							f: 0,
							spd: w.spd + 1 + Math.random() * 2,
							kind: 'runner',
							jumped: false,
						})
					}
					w.nextDog = 72 + Math.floor(Math.random() * 100)
				}

				// ── update dogs ──
				w.dogs = w.dogs
					.map(d => {
						const newX = d.x - d.spd
						const newF = d.f + 1

						if (d.kind === 'runner') {
							return { ...d, x: newX, f: newF }
						}

						// jumper: check trigger
						let { y, vy, jumped } = d
						// trigger: start jump when dog reaches the right x so peak is at cat
						const triggerX = CAT_X + 10 + d.spd * JUMPER_T_PEAK
						if (!jumped && newX <= triggerX) {
							jumped = true
							vy = JUMPER_V0
						}

						if (jumped && y < JUMPER_FLOOR) {
							vy += DOG_G
							y = Math.min(y + vy, JUMPER_FLOOR)
							if (y >= JUMPER_FLOOR) {
								y = JUMPER_FLOOR
								vy = 0
							}
						}

						return { ...d, x: newX, y, vy, jumped, f: newF }
					})
					.filter(d => d.x + 60 > 0)

				// ── collision AABB (5px inset) ──
				const cL = CAT_X + 5,
					cR = CAT_X + CAT_W - 5
				const cT = w.catY + 4,
					cB = w.catY + CAT_H - 4

				for (const d of w.dogs) {
					const dW = d.kind === 'runner' ? 42 : 30
					const dH = d.kind === 'runner' ? 46 : 26
					const dL = d.x + 4,
						dR = d.x + dW
					const dT = d.y + 4,
						dB = d.y + dH
					if (dR > cL && dL < cR && dB > cT && dT < cB) {
						w.dead = true
						w.hi = Math.max(w.hi, w.score)
					}
				}

				w.score++
			}

			// draw
			for (const d of w.dogs)
				d.kind === 'runner' ? drawRunner(ctx, d) : drawJumper(ctx, d)
			drawCat(ctx, w.catY, w.frame, w.dead, false)
			drawHUD(ctx, w.score, w.hi)

			if (w.dead) {
				ctx.fillStyle = 'rgba(205,212,228,.92)'
				ctx.font = 'bold 15px monospace'
				ctx.textAlign = 'center'
				ctx.fillText('GAME OVER', GW / 2, GH / 2 - 6)
				ctx.fillStyle = 'rgba(130,150,200,.5)'
				ctx.font = '11px monospace'
				ctx.fillText('тапни — играть снова', GW / 2, GH / 2 + 12)
			}

			w.raf = requestAnimationFrame(tick)
		}

		w.raf = requestAnimationFrame(tick)
		return () => cancelAnimationFrame(w.raf)
	}, [])

	return { jump }
}
