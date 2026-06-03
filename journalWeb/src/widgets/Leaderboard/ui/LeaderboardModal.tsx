import { createPortal } from 'react-dom'
import { X, Crown } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '@/shared/ui'
import { getCachedImageUrl } from '@/shared/lib'
import { getShortName } from '@/shared/utils/nameUtils'
import type { LeaderboardScope, LeaderboardStudent } from '@/entities/leaderboard'

interface Props {
	isOpen: boolean
	onClose: () => void
	groupStudents: LeaderboardStudent[]
	streamStudents: LeaderboardStudent[]
	myStudentId?: number
}

export function LeaderboardModal({
	isOpen,
	onClose,
	groupStudents,
	streamStudents,
	myStudentId,
}: Props) {
	const [scope, setScope] = useState<LeaderboardScope>('group')
	if (!isOpen) return null

	const students = scope === 'group' ? groupStudents : streamStudents
	const meIndex = students.findIndex(s => s.student_id === myStudentId)
	
	const top3 = students.slice(0, 3)
	const rest = students.slice(3)

	const getRankColor = (rank: number) => {
		if (rank === 1) return "#EAB308" // Gold
		if (rank === 2) return "#9CA3AF" // Silver
		if (rank === 3) return "#D97706" // Bronze
		return "var(--color-text-muted)"
	}

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 animate-in fade-in duration-200">
			{/* Backdrop */}
			<div 
				className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
				onClick={onClose} 
			/>
			
			{/* Modal Container */}
			<div className="relative w-full max-w-4xl max-h-full flex flex-col bg-app-surface border border-app-border rounded-[24px] shadow-2xl overflow-hidden">
				
				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-app-border gap-4 shrink-0">
					<h2 className="text-xl font-bold text-app-text">Рейтинг</h2>
					
					{/* Tabs */}
					<div className="flex gap-6 mx-auto sm:absolute sm:left-1/2 sm:-translate-x-1/2">
						{(['group', 'stream'] as LeaderboardScope[]).map(s => (
							<button
								key={s}
								onClick={() => setScope(s)}
								className={`pb-2 text-sm font-medium transition-colors border-b-2 ${
									scope === s
										? 'border-[#EF4444] text-app-text'
										: 'border-transparent text-app-muted hover:text-app-text'
								}`}
							>
								{s === 'group' ? 'Группа' : 'Поток'}
							</button>
						))}
					</div>
					
					<button 
						onClick={onClose}
						className="absolute top-6 right-6 text-app-muted hover:text-app-text transition-colors"
					>
						<X size={20} />
					</button>
				</div>
				
				{/* Subtitle */}
				{meIndex >= 0 && (
					<div className="text-center py-4 text-sm text-app-muted shrink-0">
						Ваше место: {meIndex + 1} из {students.length}
					</div>
				)}

				{/* Content Scroll Area */}
				<div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
					
					{/* TOP 3 */}
					<div className="flex justify-center gap-4 sm:gap-8 mb-8">
						{[
							{ student: top3[1], rank: 2, mt: 'mt-8' },
							{ student: top3[0], rank: 1, mt: 'mt-0' },
							{ student: top3[2], rank: 3, mt: 'mt-12' },
						].map(({ student, rank, mt }) => {
							if (!student) return <div key={rank} className={`w-24 sm:w-32 ${mt}`} />
							const color = getRankColor(rank)
							
							return (
								<div key={student.student_id} className={`flex flex-col items-center w-24 sm:w-32 ${mt} p-4 rounded-3xl bg-app-surface-strong border border-app-border`}>
									<div className="relative mb-3">
										{rank === 1 && (
											<Crown size={24} className="absolute -top-7 left-1/2 -translate-x-1/2 text-[#EAB308]" />
										)}
										<Avatar 
											photoUrl={getCachedImageUrl(student.photo_url) || ""} 
											fullName={student.full_name} 
											size={64} 
											className="border-[3px]"
											style={{ borderColor: color }}
										/>
										<div 
											className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#1C1C1E] text-white"
											style={{ border: `2px solid ${color}` }}
										>
											{rank}
										</div>
									</div>
									<span className="text-sm font-semibold text-app-text text-center line-clamp-1 mb-1 break-all">
										{getShortName(student.full_name)}
									</span>
									<span className="text-xs text-app-muted font-medium">
										{student.points.toLocaleString()}
									</span>
								</div>
							)
						})}
					</div>

					{/* REST OF LIST */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
						{rest.map((student, idx) => {
							const rank = idx + 4
							const isMe = student.student_id === myStudentId
							
							return (
								<div 
									key={student.student_id} 
									className={`flex items-center gap-3 px-3 py-2 rounded-2xl ${
										isMe ? 'bg-app-surface-strong border border-[#D97706]/30' : 'hover:bg-app-surface-strong transition-colors'
									}`}
								>
									<div className={`w-6 text-center text-sm font-bold ${isMe ? 'text-[#D97706]' : 'text-app-muted'}`}>
										{rank}
									</div>
									<Avatar 
										photoUrl={getCachedImageUrl(student.photo_url) || ""} 
										fullName={student.full_name} 
										size={32} 
									/>
									<div className="flex-1 min-w-0">
										<span className={`text-sm font-medium truncate ${isMe ? 'text-[#D97706]' : 'text-app-text'}`}>
											{getShortName(student.full_name)} {isMe && '(Вы)'}
										</span>
									</div>
									<div className={`text-sm font-medium ${isMe ? 'text-app-text' : 'text-app-muted'}`}>
										{student.points.toLocaleString()}
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</div>,
		document.body
	)
}
