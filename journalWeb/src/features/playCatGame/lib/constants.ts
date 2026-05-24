export const GW = 600
export const GH = 220
export const GROUND = 170

export const CAT_X = 72
export const CAT_W = 38
export const CAT_H = 46
export const CAT_FLOOR = GROUND - CAT_H

export const G = 1.0
export const JUMP_V = -Math.sqrt(2 * G * 85)

export const RUNNER_TOP = GROUND - 48

export const DOG_G = G * 0.95
const JUMP_PEAK_Y = 80
export const JUMPER_FLOOR = GROUND - 30
const JUMPER_RISE = JUMPER_FLOOR - JUMP_PEAK_Y
export const JUMPER_V0 = -Math.sqrt(2 * DOG_G * JUMPER_RISE)
export const JUMPER_T_PEAK = -JUMPER_V0 / DOG_G

const HI_SCORE_KEY = 'catgame_hi'

export function loadHiScore(): number {
	try {
		return Number(localStorage.getItem(HI_SCORE_KEY)) || 0
	} catch {
		return 0
	}
}

export function saveHiScore(score: number) {
	try {
		localStorage.setItem(HI_SCORE_KEY, String(score))
	} catch {
		/* noop */
	}
}
