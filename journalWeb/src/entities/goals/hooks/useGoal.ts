import { useGoalsStore } from '../model/store'

export function useGoal(specId: number) {
	const target = useGoalsStore(s => s.targets[specId]?.target ?? null)
	const set = useGoalsStore(s => s.setTarget)
	const remove = useGoalsStore(s => s.removeTarget)
	return {
		target,
		setTarget: (v: number) => set(specId, v),
		removeTarget: () => remove(specId),
	}
}

export function useHasAnyGoals(): boolean {
	return useGoalsStore(s => Object.keys(s.targets).length > 0)
}
