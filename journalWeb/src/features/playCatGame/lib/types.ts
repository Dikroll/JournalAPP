export type Kind = 'runner' | 'jumper'

export interface Dog {
	x: number
	y: number
	vy: number
	f: number
	spd: number
	kind: Kind
	jumped: boolean
}

export interface Cloud {
	x: number
	y: number
	w: number
}

export interface Star {
	x: number
	y: number
	r: number
	b: number
}

export interface World {
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
