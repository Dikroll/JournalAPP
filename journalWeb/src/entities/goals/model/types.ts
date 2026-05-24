export interface Goal {
	target: number
	createdAt: number
	updatedAt: number
}

export interface GoalsState {
	targets: Record<number, Goal>
	setTarget: (specId: number, target: number) => void
	removeTarget: (specId: number) => void
	reset: () => void
}
