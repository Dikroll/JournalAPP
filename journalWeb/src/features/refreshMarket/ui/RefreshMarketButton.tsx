import { RefreshButton } from '@/shared/ui'

interface Props {
	isRefreshing: boolean
	onRefresh: () => void
}

export function RefreshMarketButton({ isRefreshing, onRefresh }: Props) {
	return <RefreshButton isRefreshing={isRefreshing} onRefresh={onRefresh} />
}
