import type { World } from './types'
import {
	CAT_FLOOR,
	CAT_X,
	CAT_W,
	CAT_H,
	G,
	JUMP_V,
	GW,
	RUNNER_TOP,
	JUMPER_FLOOR,
	DOG_G,
	JUMPER_V0,
	JUMPER_T_PEAK,
	loadHiScore,
	saveHiScore,
} from './constants'

export function mkWorld(prev?: Partial<World>): World {
	return {
		on: false,
		dead: false,
		catY: CAT_FLOOR,
		catVY: 0,
		grounded: true,
		dogs: [],
		clouds: prev?.clouds ?? [],
		stars: prev?.stars ?? [],
		score: 0,
		spd: 5.2,
		frame: 0,
		nextDog: 110,
		raf: prev?.raf ?? 0,
		hi: prev?.hi ?? loadHiScore(),
	}
}

export function applyCatJump(w: World) {
	if (w.grounded) {
		w.catVY = JUMP_V
		w.grounded = false
	}
}

export function updateCatPhysics(w: World) {
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
}

export function updateSpeed(w: World) {
	w.spd = 5.2 + Math.floor(w.score / 350) * 0.35
}

export function spawnDogs(w: World) {
	w.nextDog--
	if (w.nextDog > 0) return

	const isJumper = Math.random() < 0.32
	if (isJumper) {
		w.dogs.push({
			x: GW + 10,
			y: JUMPER_FLOOR,
			vy: 0,
			f: 0,
			spd: w.spd + 2.5,
			kind: 'jumper',
			jumped: false,
		})
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

export function updateDogs(w: World) {
	w.dogs = w.dogs
		.map(d => {
			const newX = d.x - d.spd
			const newF = d.f + 1

			if (d.kind === 'runner') {
				return { ...d, x: newX, f: newF }
			}

			let { y, vy, jumped } = d
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
}

export function checkCollisions(w: World) {
	const cL = CAT_X + 8
	const cR = CAT_X + CAT_W - 6
	const cT = w.catY + 8
	const cB = w.catY + CAT_H - 6

	for (const d of w.dogs) {
		let dL: number, dR: number, dT: number, dB: number
		if (d.kind === 'runner') {
			dL = d.x + 5
			dR = d.x + 34
			dT = RUNNER_TOP + 8
			dB = RUNNER_TOP + 36
		} else {
			dL = d.x + 3
			dR = d.x + 29
			dT = d.y + 8
			dB = d.y + 23
		}
		if (dR > cL && dL < cR && dB > cT && dT < cB) {
			w.dead = true
			w.hi = Math.max(w.hi, w.score)
			saveHiScore(w.hi)
			return
		}
	}
}
