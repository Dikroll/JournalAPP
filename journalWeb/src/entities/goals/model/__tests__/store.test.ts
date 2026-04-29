import { beforeEach, describe, expect, it } from 'vitest'
import { useGoalsStore } from '../store'

describe('useGoalsStore', () => {
	beforeEach(() => {
		useGoalsStore.getState().reset()
	})

	it('starts with empty targets', () => {
		expect(useGoalsStore.getState().targets).toEqual({})
	})

	it('sets a target, clamped to [2, 5] and rounded', () => {
		useGoalsStore.getState().setTarget(10, 7)
		expect(useGoalsStore.getState().targets[10].target).toBe(5)
		useGoalsStore.getState().setTarget(11, 1)
		expect(useGoalsStore.getState().targets[11].target).toBe(2)
		useGoalsStore.getState().setTarget(12, 4.7)
		expect(useGoalsStore.getState().targets[12].target).toBe(5)
	})

	it('setTarget fills createdAt/updatedAt', () => {
		const before = Date.now()
		useGoalsStore.getState().setTarget(1, 4)
		const g = useGoalsStore.getState().targets[1]
		expect(g.createdAt).toBeGreaterThanOrEqual(before)
		expect(g.updatedAt).toBe(g.createdAt)
	})

	it('setTarget on existing keeps createdAt, bumps updatedAt', async () => {
		useGoalsStore.getState().setTarget(1, 4)
		const { createdAt } = useGoalsStore.getState().targets[1]
		await new Promise(r => setTimeout(r, 5))
		useGoalsStore.getState().setTarget(1, 5)
		const after = useGoalsStore.getState().targets[1]
		expect(after.createdAt).toBe(createdAt)
		expect(after.updatedAt).toBeGreaterThan(createdAt)
		expect(after.target).toBe(5)
	})

	it('removeTarget drops the entry', () => {
		useGoalsStore.getState().setTarget(1, 4)
		useGoalsStore.getState().removeTarget(1)
		expect(useGoalsStore.getState().targets[1]).toBeUndefined()
	})

	it('reset clears everything', () => {
		useGoalsStore.getState().setTarget(1, 4)
		useGoalsStore.getState().setTarget(2, 5)
		useGoalsStore.getState().reset()
		expect(useGoalsStore.getState().targets).toEqual({})
	})
})
