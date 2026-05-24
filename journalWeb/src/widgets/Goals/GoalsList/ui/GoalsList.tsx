import type { GoalCardData } from '@/features/goalForecast'
import { GoalCard } from '../../GoalCard/ui/GoalCard'

interface Props {
	items: GoalCardData[]
	onItemPress: (specId: number) => void
}

export function GoalsList({ items, onItemPress }: Props) {
	if (items.length === 0) return null
	return (
		<div>
			{items.map(item => (
				<GoalCard key={item.specId} data={item} onPress={onItemPress} />
			))}
		</div>
	)
}
